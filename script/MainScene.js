"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Button_1 = require("./Button");
var Fish_1 = require("./Fish");
var MainScene = /** @class */ (function (_super) {
    __extends(MainScene, _super);
    function MainScene(param) {
        var _this = this;
        param.assetIds =
            ["title", "time", "pt", "start", "finish", "warning", "tairyou", "tairyou2", "hari",
                "fish", "fish2", "ebi", "ika", "kani", "kurage",
                "ningyo", "pengin", "kame", "maguro",
                "same", "iruka", "king", "tako", "siva", "hebi", "robo",
                "kuma", "line", "img_numbers_n", "img_numbers_n_red", "test", "name", "hand",
                "bgm", "biri", "move", "clear", "miss", "se_start", "se_timeup"];
        _this = _super.call(this, param) || this;
        var tl = require("@akashic-extension/akashic-timeline");
        var timeline = new tl.Timeline(_this);
        _this.loaded.add(function () {
            var score = 0;
            var hitCnt = 0;
            var isStart = false;
            _this.assets["bgm"].play().changeVolume(0.2);
            g.game.vars.gameState = { score: 0 };
            // 何も送られてこない時は、標準の乱数生成器を使う
            var random = g.game.random;
            _this.message.add(function (msg) {
                if (msg.data && msg.data.type === "start" && msg.data.parameters) {
                    var sessionParameters = msg.data.parameters;
                    if (sessionParameters.randomSeed != null) {
                        // プレイヤー間で共通の乱数生成器を生成
                        // `g.XorshiftRandomGenerator` は Akashic Engine の提供する乱数生成器実装で、 `g.game.random` と同じ型。
                        random = new g.XorshiftRandomGenerator(sessionParameters.randomSeed);
                    }
                }
            });
            // 配信者のIDを取得
            _this.lastJoinedPlayerId = "";
            g.game.join.add(function (ev) {
                _this.lastJoinedPlayerId = ev.player.id;
            });
            // 背景
            var bg = new g.FilledRect({ scene: _this, width: 0, height: 0, cssColor: "#000000" });
            _this.append(bg);
            bg.touchable = true;
            bg.hide();
            if (typeof window !== "undefined" && window.RPGAtsumaru) {
                bg.width = 640;
                bg.height = 360;
                bg.cssColor = "#aaccff";
                bg.modified();
            }
            _this.font = new g.DynamicFont({
                game: g.game,
                fontFamily: g.FontFamily.Monospace,
                size: 15
            });
            // タイトル
            var sprTitle = new g.Sprite({ scene: _this, src: _this.assets["title"], x: 70 });
            _this.append(sprTitle);
            timeline.create(sprTitle, {
                modified: sprTitle.modified, destroyd: sprTitle.destroyed
            }).wait(5000).moveBy(-800, 0, 200).call(function () {
                bg.show();
                uiBase.show();
                isStart = true;
                reset();
            });
            var glyph = JSON.parse(_this.assets["test"].data);
            var numFont = new g.BitmapFont({
                src: _this.assets["img_numbers_n"],
                map: glyph.map,
                defaultGlyphWidth: glyph.width,
                defaultGlyphHeight: glyph.height,
                missingGlyph: glyph.missingGlyph
            });
            var numFontRed = new g.BitmapFont({
                src: _this.assets["img_numbers_n_red"],
                map: glyph.map,
                defaultGlyphWidth: glyph.width,
                defaultGlyphHeight: glyph.height,
                missingGlyph: glyph.missingGlyph
            });
            var font = new g.DynamicFont({
                game: g.game,
                fontFamily: g.FontFamily.Monospace,
                size: 24
            });
            var uiBase = new g.E({ scene: _this });
            _this.append(uiBase);
            uiBase.hide();
            var fg = new g.FilledRect({ scene: _this, width: 640, height: 480, cssColor: "#ff0000", opacity: 0.0 });
            _this.append(fg);
            //スコア
            var labelScore = new g.Label({
                scene: _this, font: numFont, fontSize: 32, text: "0P", x: 100, y: 5,
                width: 350, textAlign: g.TextAlign.Right, widthAutoAdjust: false
            });
            uiBase.append(labelScore);
            //何匹釣れたか
            var cntHitAll = 0;
            var labelNum = new g.Label({
                scene: _this, font: numFont, fontSize: 32, text: "0Q", x: 400, y: 35,
                width: 100, textAlign: g.TextAlign.Right, widthAutoAdjust: false
            });
            uiBase.append(labelNum);
            //連れた魚の詳細表示用
            var sprFishStates = [];
            var sprFishNames = [];
            var labelFishCnts = [];
            var labelFishScores = [];
            for (var i = 0; i < 5; i++) {
                var base = new g.E({
                    scene: _this, x: 450,
                    y: 65 + (60 * i)
                });
                uiBase.append(base);
                base.hide();
                sprFishStates.push(base);
                var spr = new g.FrameSprite({
                    scene: _this,
                    src: _this.assets["name"],
                    width: 150,
                    height: 30,
                    frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
                });
                base.append(spr);
                sprFishNames.push(spr);
                var label = new g.Label({
                    scene: _this, font: numFont, fontSize: 25, text: "*2", x: 0, y: 3,
                    width: 190, textAlign: g.TextAlign.Right, widthAutoAdjust: false
                });
                base.append(label);
                labelFishCnts.push(label);
                var label2 = new g.Label({
                    scene: _this, font: numFont, fontSize: 28, text: "+100000", x: 0, y: 30,
                    width: 190, textAlign: g.TextAlign.Right, widthAutoAdjust: false
                });
                base.append(label2);
                labelFishScores.push(label2);
            }
            //組み合わせボーナス表示
            var sprHandStates = [];
            var labelHandScores = [];
            var sprHandNames = [];
            for (var i = 0; i < 2; i++) {
                var base = new g.E({
                    scene: _this, x: 250,
                    y: 245 + (60 * (1 - i))
                });
                uiBase.append(base);
                base.hide();
                sprHandStates.push(base);
                var spr = new g.FrameSprite({
                    scene: _this,
                    src: _this.assets["hand"],
                    width: 150,
                    height: 30,
                    frames: [0, 1, 2, 3, 4, 5]
                });
                base.append(spr);
                sprHandNames.push(spr);
                var label = new g.Label({
                    scene: _this, font: numFont, fontSize: 28, text: "+100000", x: 0, y: 30,
                    width: 190, textAlign: g.TextAlign.Right, widthAutoAdjust: false
                });
                base.append(label);
                labelHandScores.push(label);
            }
            //タイム
            uiBase.append(new g.Sprite({ scene: _this, src: _this.assets["time"], x: 540, y: 2 }));
            var labelTime = new g.Label({ scene: _this, font: numFont, fontSize: 32, text: "70", x: 580, y: 5 });
            uiBase.append(labelTime);
            //加点分
            var labelPlus = new g.Label({ scene: _this, font: numFontRed, fontSize: 32, text: "0", x: 250, y: 60 });
            uiBase.append(labelPlus);
            //スタート
            var sprStart = new g.Sprite({ scene: _this, src: _this.assets["start"], x: 70, y: 100 });
            uiBase.append(sprStart);
            //終了
            var sprFinish = new g.Sprite({ scene: _this, src: _this.assets["finish"], x: 120, y: 100 });
            uiBase.append(sprFinish);
            //大漁
            var sprTairyou = new g.Sprite({ scene: _this, src: _this.assets["tairyou"], x: 120, y: 100 });
            uiBase.append(sprTairyou);
            //大量ボーナス用
            var sprTairyou2 = new g.FrameSprite({ scene: _this, src: _this.assets["tairyou2"], width: 280, height: 40, frames: [0, 1], x: 160, y: 250 });
            uiBase.append(sprTairyou2);
            //魚群注意
            var sprWarning = new g.Sprite({ scene: _this, src: _this.assets["warning"], x: 50, y: 100 });
            uiBase.append(sprWarning);
            //リセットボタン
            var btnReset = new Button_1.Button(_this, ["リセット"], 520, 300);
            if (typeof window !== "undefined" && window.RPGAtsumaru) {
                uiBase.append(btnReset);
            }
            btnReset.pushEvent = function (ev) { return reset(); };
            //くま
            var sprKuma = new g.FrameSprite({
                scene: _this,
                src: _this.assets["kuma"],
                width: 100,
                height: 200,
                frames: [0, 1, 2],
                x: 50,
                y: -20
            });
            bg.append(sprKuma);
            //水面
            var sprLine = new g.FrameSprite({
                scene: _this,
                src: _this.assets["line"],
                width: 640,
                height: 20,
                frames: [0, 1],
                interval: 500,
                y: 120
            });
            sprLine.start();
            bg.append(sprLine);
            //針
            var hariCnt = 2;
            var sprHari = new g.E({
                scene: _this,
                width: 80,
                height: 130,
                x: 135,
                y: g.game.height - 130,
            });
            bg.append(sprHari);
            //糸
            sprHari.append(new g.FilledRect({
                scene: _this,
                width: 1,
                height: 350,
                cssColor: "black",
                x: 39,
                y: -243
            }));
            sprHari.append(new g.FilledRect({
                scene: _this,
                width: 1,
                height: 350,
                cssColor: "white",
                x: 40,
                y: -243,
                opacity: 0.5
            }));
            var sprHaris = [];
            for (var i = 0; i < 5; i++) {
                var spr = new g.Sprite({
                    scene: _this,
                    src: _this.assets["hari"],
                    x: 10,
                    y: 100 - (i * 25)
                });
                if (i % 2)
                    spr.scaleX = -1;
                spr.modified();
                sprHaris.push(spr);
                sprHari.append(spr);
            }
            //sprHari.children = [];
            var hariState = 0;
            _this.pointDownCapture.add(function () {
                if (!isStart)
                    return;
                if (sprFinish.state === 0 /* None */)
                    return;
                if (hariState === 3)
                    hariState = 1;
            });
            //魚
            var sprFishs = [];
            for (var i = 0; i < 6; i++) {
                var sprFish = new Fish_1.Fish(_this);
                bg.append(sprFish);
                sprFishs.push(sprFish);
            }
            //メインループ
            var frameCnt = 0;
            var startTime = 0;
            var tweens = [];
            var handBonus = [3000, 8000, 20000, 5000, 15000, 50000];
            var rareTime = 12; //大物が出現する時間
            var bkTime = 0;
            var timeLimit = 70;
            _this.update.add(function () {
                if (!isStart)
                    return;
                if (hariState === 1) {
                    if (sprHari.y < -80) {
                        hariState = 2;
                        var num_1 = 0;
                        cntHitAll += hitCnt;
                        labelNum.text = "" + cntHitAll + "Q";
                        labelNum.invalidate();
                        //釣れた魚をカウント
                        var kurageFlg_1 = false;
                        sprFishs.forEach(function (e) {
                            if (kurageFlg_1)
                                return;
                            if (e.flg) {
                                if (e.num === 5) {
                                    kurageFlg_1 = true;
                                    num_1 = 0;
                                    return;
                                }
                                num_1 += e.score;
                            }
                        });
                        //釣った魚の情報表示用
                        var hash_1 = {};
                        var singleFlg_1 = true; //１匹ずつしか釣れていない
                        var maxHit_1 = 0; //同種最大
                        sprFishs.forEach(function (e) {
                            if (e.flg) {
                                if (hash_1[e.num]) {
                                    hash_1[e.num]++;
                                    singleFlg_1 = false;
                                    if (maxHit_1 < hash_1[e.num])
                                        maxHit_1 = hash_1[e.num];
                                }
                                else {
                                    hash_1[e.num] = 1;
                                }
                            }
                        });
                        sprFishStates.forEach(function (e) { return e.hide(); });
                        var cnt = 0;
                        tweens.forEach(function (e) {
                            timeline.remove(e);
                        });
                        tweens.length = 0;
                        var _loop_1 = function (i) {
                            if (hash_1[i]) {
                                var s_1 = sprFishStates[cnt];
                                s_1.show();
                                tweens.push(timeline.create().wait(3000).call(function () { return s_1.hide(); }));
                                sprFishNames[cnt].frameNumber = i;
                                sprFishNames[cnt].modified();
                                labelFishCnts[cnt].text = (hash_1[i] > 1) ? "*" + hash_1[i] : "";
                                labelFishCnts[cnt].invalidate();
                                if (!kurageFlg_1) {
                                    labelFishScores[cnt].text = "+" + (Fish_1.Fish.scores[i] * hash_1[i] * 100);
                                }
                                else {
                                    labelFishScores[cnt].text = "+0";
                                }
                                labelFishScores[cnt].invalidate();
                                cnt++;
                            }
                        };
                        for (var i = 0; i < 17; i++) {
                            _loop_1(i);
                        }
                        //組み合わせボーナスの表示
                        sprHandStates[0].hide();
                        if (!kurageFlg_1) {
                            var i = -1;
                            if (singleFlg_1 && hitCnt >= 3) {
                                i = hitCnt - 3;
                            }
                            else if (maxHit_1 >= 3) {
                                i = maxHit_1;
                            }
                            if (i !== -1) {
                                sprHandNames[0].frameNumber = i;
                                labelHandScores[0].text = "+" + handBonus[i];
                                labelHandScores[0].invalidate();
                                sprHandNames[0].modified();
                                sprHandStates[0].show();
                                tweens.push(timeline.create().wait(3000).call(function () { return sprHandStates[0].hide(); }));
                                num_1 += handBonus[i];
                            }
                        }
                        //大量
                        if (!kurageFlg_1 && hitCnt >= hariCnt) {
                            if (hariCnt < 5) {
                                sprHaris[hariCnt].show();
                                sprTairyou2.frameNumber = 0;
                                hariCnt++;
                            }
                            else {
                                sprTairyou2.frameNumber = 1;
                                num_1 += 10000;
                            }
                            sprTairyou.show();
                            timeline.create(sprTairyou, {
                                modified: sprTairyou.modified, destroyd: sprTairyou.destroyed
                            }).wait(1000).call(function () { return sprTairyou.hide(); });
                            sprTairyou2.modified();
                            timeline.create(sprTairyou2, {
                                modified: sprTairyou2.modified, destroyd: sprTairyou2.destroyed
                            }).wait(200).call(function () { return sprTairyou2.show(); }).wait(800).call(function () { return sprTairyou2.hide(); });
                        }
                        sprKuma.frameNumber = kurageFlg_1 ? 2 : 1;
                        sprKuma.modified();
                        sprHari.angle = -30;
                        sprHari.modified();
                        if (kurageFlg_1) {
                            _this.assets["biri"].play().changeVolume(0.3);
                        }
                        else if (hitCnt !== 0) {
                            _this.assets["clear"].play().changeVolume(0.3);
                        }
                        else {
                            _this.assets["miss"].play().changeVolume(0.3);
                        }
                        addScore(num_1);
                        hitCnt = 0;
                        timeline.create(sprKuma, {
                            modified: sprKuma.modified, destroyd: sprKuma.destroyed
                        }).wait(500).call(function () {
                            //釣ったあとの処理
                            sprKuma.frameNumber = 0;
                            hariState = 0;
                            sprHari.angle = 0;
                            sprHari.modified();
                            //釣れた魚をカウントしてリリース
                            sprFishs.forEach(function (e) {
                                if (e.flg) {
                                    bg.append(e);
                                    e.reset();
                                }
                            });
                        });
                    }
                    sprHari.y -= 10;
                    sprFishs.forEach(function (e) {
                        //針との当たり判定
                        if (hariCnt > hitCnt) {
                            if (!e.flg && collision(e.collisionArea, sprHari, bg)) {
                                e.hit(hitCnt);
                                sprHari.append(e);
                                hitCnt++;
                                _this.assets["move"].play().changeVolume(0.3);
                            }
                        }
                    });
                }
                else if (hariState === 0) {
                    if (sprHari.y <= g.game.height - sprHari.height)
                        sprHari.y += 10;
                    else
                        hariState = 3;
                }
                var t = timeLimit - Math.floor((Date.now() - startTime) / 1000);
                var t2 = ((timeLimit + 2) - Math.floor(frameCnt / 30)); //フレームレート改竄バグによるチート行為対応
                if (t <= -1 || t2 === 0) {
                    labelTime.text = "0";
                    labelTime.invalidate();
                    if (sprFinish.state === 1 /* Hidden */) {
                        sprFinish.show();
                        _this.assets["se_timeup"].play().changeVolume(0.8);
                        timeline.create().wait(3000).call(function () {
                            if (typeof window !== "undefined" && window.RPGAtsumaru) {
                                window.RPGAtsumaru.experimental.scoreboards.setRecord(1, g.game.vars.gameState.score).then(function () {
                                    window.RPGAtsumaru.experimental.scoreboards.display(1);
                                    btnReset.show();
                                });
                            }
                        });
                    }
                    fg.cssColor = "#000000";
                    fg.opacity = 0.1;
                    fg.modified();
                }
                else if (t >= 0) {
                    labelTime.text = "" + t;
                    labelTime.invalidate();
                    if (t === rareTime && Fish_1.Fish.numsCnt < 50) {
                        Fish_1.Fish.numsCnt = 50;
                    }
                    if (bkTime !== t && t <= 5) {
                        fg.opacity = 0.1;
                        fg.modified();
                        timeline.create().wait(500).call(function () {
                            fg.opacity = 0.0;
                            fg.modified();
                        });
                    }
                    bkTime = t;
                    frameCnt++;
                }
            });
            //スコアの追加処理
            var addScore = function (num) {
                labelPlus.text = "+" + num;
                labelPlus.invalidate();
                labelPlus.show();
                timeline.create(labelPlus, {
                    modified: labelPlus.modified, destroyd: labelPlus.destroyed
                }).wait(2000).call(function () { return labelPlus.hide(); });
                timeline.create(labelScore, {
                    modified: labelScore.modified, destroyd: labelScore.destroyed
                }).every(function (e, p) {
                    labelScore.text = "" + (score + Math.floor(num * p)) + "P";
                    labelScore.invalidate();
                }, 500).call(function () {
                    score += num;
                    g.game.vars.gameState.score = score;
                });
            };
            //リセット
            var reset = function () {
                sprStart.show();
                sprFinish.hide();
                sprTairyou.hide();
                sprTairyou2.hide();
                sprWarning.hide();
                labelPlus.hide();
                btnReset.hide();
                hariCnt = 2;
                fg.cssColor = "#ff0000";
                fg.opacity = 0.0;
                fg.modified();
                for (var i = hariCnt; i < 5; i++) {
                    sprHaris[i].hide();
                }
                timeline.create(sprStart, {
                    modified: sprStart.modified, destroyd: sprStart.destroyed
                }).wait(2000).call(function () { return sprStart.hide(); });
                for (var i = 0; i < 20; i++) {
                    if ((i % 10) === 5) {
                        Fish_1.Fish.nums[i] = 5;
                    }
                    else {
                        Fish_1.Fish.nums[i] = random.get(0, 4);
                    }
                }
                for (var i = 20; i < 50; i++) {
                    Fish_1.Fish.nums[i] = random.get(0, 11);
                }
                for (var i = 50; i < 100; i++) {
                    Fish_1.Fish.nums[i] = random.get(6, 16);
                }
                Fish_1.Fish.numsCnt = 0;
                sprFishs.forEach(function (e) { return e.reset(); });
                score = 0;
                labelScore.text = "0P";
                labelScore.invalidate();
                labelTime.text = "70";
                labelTime.invalidate();
                cntHitAll = 0;
                labelNum.text = "0Q";
                labelNum.invalidate();
                isStart = true;
                _this.assets["se_start"].play().changeVolume(0.8);
                startTime = Date.now();
                frameCnt = 0;
            };
            //シンプルな当たり判定。
            //親子関係のみ考慮(拡大、回転があると動かない,シーンには未対応)
            var collision = function (e1, e2, baseE) {
                var x1 = e1.x;
                var y1 = e1.y;
                var e = e1;
                while (true) {
                    if (baseE === e || e.parent === undefined)
                        break;
                    e = e.parent;
                    x1 += e.x;
                    y1 += e.y;
                }
                var w1 = x1 + e1.width;
                var h1 = y1 + e1.height;
                var x2 = e2.x;
                var y2 = e2.y;
                e = e2;
                while (true) {
                    if (baseE === e || e.parent === undefined)
                        break;
                    e = e.parent;
                    x2 += e.x;
                    y2 += e.y;
                }
                var w2 = x2 + e2.width;
                var h2 = y2 + e2.height;
                return (x2 < w1 && x1 < w2 && y2 < h1 && y1 < h2);
            };
        });
        return _this;
    }
    return MainScene;
}(g.Scene));
exports.MainScene = MainScene;
