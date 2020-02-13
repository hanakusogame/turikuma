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
//魚クラス
var Fish = /** @class */ (function (_super) {
    __extends(Fish, _super);
    function Fish(scene) {
        var _this = _super.call(this, { scene: scene }) || this;
        _this.muki = 1;
        _this.speed = 3;
        _this.score = 100;
        _this.flg = false;
        _this.num = 0;
        var anchor = new g.E({ scene: scene });
        _this.append(anchor);
        var sprImages = [];
        var assetNames = ["fish", "fish2", "ika", "ebi", "kani", "kurage",
            "ningyo", "pengin", "kame", "maguro",
            "same", "iruka", "king", "tako", "siva", "hebi", "robo"];
        for (var i = 0; i < assetNames.length; i++) {
            var image = scene.assets[assetNames[i]];
            sprImages.push(new g.FrameSprite({
                scene: scene,
                src: image,
                width: image.width,
                height: image.height / 2,
                frames: [0, 1],
                interval: 200
            }));
        }
        _this.sprImage = sprImages[0];
        anchor.append(_this.sprImage);
        _this.collisionArea = new g.FilledRect({ scene: scene, width: 40, height: 40, cssColor: "#ff000020" });
        _this.append(_this.collisionArea);
        _this.collisionArea.hide();
        var cntLoop = g.game.random.get(0, 30);
        var cntTest = 0;
        _this.update.add(function (ev) {
            if (!_this.flg) {
                if (_this.muki === 1 && _this.x > g.game.width + (_this.sprImage.width / 2)) {
                    if (g.game.random.get(0, 100) <= Fish.escapes[_this.num]) {
                        _this.reset();
                    }
                    turn();
                }
                else if (_this.muki === -1 && _this.x < -(_this.sprImage.width / 2)) {
                    if (g.game.random.get(0, 100) <= Fish.escapes[_this.num]) {
                        _this.reset();
                    }
                    turn();
                }
                _this.x += (_this.speed * _this.muki);
                //エビ・イカ(途中でターンする、たまに早く動く)
                if (_this.num === 2 || _this.num === 3) {
                    if ((cntLoop % 20) === 0) {
                        cntTest++;
                        if ((cntTest % 5) === 0) {
                            _this.speed = 12;
                            if (_this.num === 3 && _this.muki === -1) {
                                _this.speed = 17;
                            }
                        }
                        else {
                            if (_this.num === 3 && g.game.random.get(0, 2) === 0) {
                                turn();
                            }
                            _this.speed = g.game.random.get(2, 12) / 2;
                        }
                    }
                }
                //マグロ、サメ(たまに早く動く)
                if (_this.num === 9 || _this.num === 10) {
                    if ((cntLoop % 20) === 0) {
                        cntTest++;
                        if ((cntTest % 5) === 0) {
                            _this.speed = 15;
                        }
                        else {
                            _this.speed = g.game.random.get(2, 12) / 2;
                        }
                    }
                }
                //人魚、ペンギン、亀(途中でターンする)
                if (_this.num === 6 || _this.num === 7 || _this.num === 8) {
                    if ((cntLoop % 20) === 0) {
                        if (g.game.random.get(0, 50) === 0) {
                            turn();
                        }
                    }
                }
                //クラゲ(上下にも動く)
                if (_this.num === 5) {
                    if (cntTest === 1 && _this.y > g.game.height - 50) {
                        cntTest = -1;
                    }
                    else if (cntTest === -1 && _this.y < 150) {
                        cntTest = 1;
                    }
                    _this.y += cntTest;
                }
            }
            _this.modified();
            cntLoop++;
        });
        var turn = function () {
            _this.muki *= -1;
            if (_this.num !== 4) {
                anchor.scaleX *= -1; //カニ以外の表示反転
            }
        };
        _this.hit = function (num) {
            _this.flg = true;
            _this.x = -_this.muki * 20 + 40;
            _this.y = 20 * (5 - num);
            anchor.angle = (45 + g.game.random.get(0, 20)) * -_this.muki;
            _this.modified();
        };
        _this.reset = function () {
            if (_this.sprImage.parent !== undefined) {
                anchor.remove(_this.sprImage);
            }
            _this.num = Fish.nums[Fish.numsCnt];
            Fish.numsCnt = (Fish.numsCnt + 1) % 100;
            _this.sprImage = sprImages[_this.num];
            anchor.append(_this.sprImage);
            _this.flg = false;
            _this.muki = -1;
            _this.score = Fish.scores[_this.num] * 100;
            if (_this.num === 5) {
                _this.speed = 2; //クラゲ
            }
            else {
                _this.speed = g.game.random.get(6, 15) / 2;
            }
            _this.x = g.game.width + _this.sprImage.width - _this.sprImage.x;
            if (_this.num !== 4) {
                _this.y = g.game.random.get(120, g.game.height);
            }
            else {
                _this.y = g.game.random.get(g.game.height - 50, g.game.height); //カニだけ下のほうにしか表示されない
            }
            anchor.scaleX = 1;
            anchor.angle = 0;
            if (_this.num === 5) {
                //クラゲ
                _this.sprImage.x = -(_this.sprImage.width / 2);
                _this.sprImage.y = -(_this.sprImage.height / 2);
                _this.collisionArea.x = -5;
                _this.collisionArea.y = -5;
                _this.collisionArea.width = 10;
                _this.collisionArea.height = 10;
            }
            else {
                _this.sprImage.x = -(_this.sprImage.width / 3);
                _this.sprImage.y = -(_this.sprImage.height / 2);
                _this.collisionArea.x = -(_this.sprImage.width / 3);
                _this.collisionArea.y = -(_this.sprImage.height / 2);
                _this.collisionArea.width = _this.sprImage.width / 1.5;
                _this.collisionArea.height = _this.sprImage.height;
            }
            cntTest = 1;
            _this.sprImage.start();
        };
        return _this;
    }
    Fish.nums = new Array(100);
    Fish.numsCnt = 0;
    Fish.scores = [8, 10, 12, 13, 14, 0, 100, 30, 40, 50, 120, 120, 200, 150, 170, 180, 190];
    Fish.escapes = [1, 1, 1, 1, 1, 50, 10, 10, 10, 50, 50, 80, 80, 80, 80, 80, 80];
    return Fish;
}(g.E));
exports.Fish = Fish;
