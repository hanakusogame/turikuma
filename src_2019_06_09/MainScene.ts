import { Button } from "./Button";
import { Fish } from "./Fish";
declare function require(x: string): any;
export class MainScene extends g.Scene {
	public lastJoinedPlayerId: string; // 配信者のID
	private font: g.Font;

	constructor(param: g.SceneParameterObject) {
		param.assetIds =
			["title", "time", "pt", "start", "finish", "warning", "tairyou", "tairyou2", "hari",
				"fish", "fish2", "ebi", "ika", "kani", "kurage",
				"ningyo", "pengin", "kame", "maguro",
				"same", "iruka", "king", "tako", "siva", "hebi", "robo",
				"kuma", "line", "img_numbers_n", "img_numbers_n_red", "test", "name", "hand",
				"bgm", "biri", "move", "clear", "miss", "se_start", "se_timeup"];
		super(param);

		const tl = require("@akashic-extension/akashic-timeline");
		const timeline = new tl.Timeline(this);

		this.loaded.add(() => {

			let score = 0;
			let hitCnt = 0;
			let isStart = false;

			(this.assets["bgm"] as g.AudioAsset).play().changeVolume(0.2);

			g.game.vars.gameState = { score: 0 };

			// 何も送られてこない時は、標準の乱数生成器を使う
			let random = g.game.random;

			this.message.add((msg) => {
				if (msg.data && msg.data.type === "start" && msg.data.parameters) { // セッションパラメータのイベント
					const sessionParameters = msg.data.parameters;
					if (sessionParameters.randomSeed != null) {
						// プレイヤー間で共通の乱数生成器を生成
						// `g.XorshiftRandomGenerator` は Akashic Engine の提供する乱数生成器実装で、 `g.game.random` と同じ型。
						random = new g.XorshiftRandomGenerator(sessionParameters.randomSeed);
					}
				}
			});

			// 配信者のIDを取得
			this.lastJoinedPlayerId = "";
			g.game.join.add((ev) => {
				this.lastJoinedPlayerId = ev.player.id;
			});

			// 背景
			const bg = new g.FilledRect({ scene: this, width: 0, height: 0, cssColor: "#000000" });
			this.append(bg);
			bg.touchable = true;
			bg.hide();
			if (typeof window !== "undefined" && window.RPGAtsumaru) {
				bg.width = 640;
				bg.height = 360;
				bg.cssColor = "#aaccff";
				bg.modified();
			}

			this.font = new g.DynamicFont({
				game: g.game,
				fontFamily: g.FontFamily.Monospace,
				size: 15
			});

			// タイトル
			const sprTitle = new g.Sprite({ scene: this, src: this.assets["title"], x: 70 });
			this.append(sprTitle);
			timeline.create(
				sprTitle, {
					modified: sprTitle.modified, destroyd: sprTitle.destroyed
				}).wait(5000).moveBy(-800, 0, 200).call(() => {
					bg.show();
					uiBase.show();
					isStart = true;
					reset();
				});

			const glyph = JSON.parse((this.assets["test"] as g.TextAsset).data);
			const numFont = new g.BitmapFont({
				src: this.assets["img_numbers_n"],
				map: glyph.map,
				defaultGlyphWidth: glyph.width,
				defaultGlyphHeight: glyph.height,
				missingGlyph: glyph.missingGlyph
			});

			const numFontRed = new g.BitmapFont({
				src: this.assets["img_numbers_n_red"],
				map: glyph.map,
				defaultGlyphWidth: glyph.width,
				defaultGlyphHeight: glyph.height,
				missingGlyph: glyph.missingGlyph
			});

			const font = new g.DynamicFont({
				game: g.game,
				fontFamily: g.FontFamily.Monospace,
				size: 24
			});

			const uiBase = new g.E({ scene: this });
			this.append(uiBase);
			uiBase.hide();

			//スコア
			const labelScore = new g.Label({
				scene: this, font: numFont, fontSize: 32, text: "0P", x: 100, y: 5,
				width: 350, textAlign: g.TextAlign.Right, widthAutoAdjust: false
			});
			uiBase.append(labelScore);

			//何匹釣れたか
			let cntHitAll = 0;
			const labelNum = new g.Label({
				scene: this, font: numFont, fontSize: 32, text: "0Q", x: 400, y: 35,
				width: 100, textAlign: g.TextAlign.Right, widthAutoAdjust: false
			});
			uiBase.append(labelNum);

			//連れた魚の詳細表示用
			const sprFishStates: g.E[] = [];
			const sprFishNames: g.FrameSprite[] = [];
			const labelFishCnts: g.Label[] = [];
			const labelFishScores: g.Label[] = [];

			for (let i = 0; i < 5; i++) {
				const base = new g.E({
					scene: this, x: 450,
					y: 65 + (60 * i)
				});
				uiBase.append(base);
				base.hide();
				sprFishStates.push(base);

				const spr = new g.FrameSprite({
					scene: this,
					src: this.assets["name"] as g.ImageAsset,
					width: 150,
					height: 30,
					frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
				});
				base.append(spr);
				sprFishNames.push(spr);

				const label = new g.Label({
					scene: this, font: numFont, fontSize: 25, text: "*2", x: 0, y: 3,
					width: 190, textAlign: g.TextAlign.Right, widthAutoAdjust: false
				});
				base.append(label);
				labelFishCnts.push(label);

				const label2 = new g.Label({
					scene: this, font: numFont, fontSize: 28, text: "+100000", x: 0, y: 30,
					width: 190, textAlign: g.TextAlign.Right, widthAutoAdjust: false
				});
				base.append(label2);
				labelFishScores.push(label2);
			}

			//組み合わせボーナス表示
			const sprHandStates: g.E[] = [];
			const labelHandScores: g.Label[] = [];
			const sprHandNames: g.FrameSprite[] = [];
			for (let i = 0; i < 2; i++) {
				const base = new g.E({
					scene: this, x: 250,
					y: 245 + (60 * (1 - i))
				});
				uiBase.append(base);
				base.hide();
				sprHandStates.push(base);

				const spr = new g.FrameSprite({
					scene: this,
					src: this.assets["hand"] as g.ImageAsset,
					width: 150,
					height: 30,
					frames: [0, 1, 2, 3, 4, 5]
				});
				base.append(spr);
				sprHandNames.push(spr);

				const label = new g.Label({
					scene: this, font: numFont, fontSize: 28, text: "+100000", x: 0, y: 30,
					width: 190, textAlign: g.TextAlign.Right, widthAutoAdjust: false
				});
				base.append(label);
				labelHandScores.push(label);
			}

			//タイム
			uiBase.append(new g.Sprite({ scene: this, src: this.assets["time"], x: 540, y: 2 }));
			const labelTime = new g.Label({ scene: this, font: numFont, fontSize: 32, text: "70", x: 580, y: 5 });
			uiBase.append(labelTime);

			//加点分
			const labelPlus = new g.Label({ scene: this, font: numFontRed, fontSize: 32, text: "0", x: 250, y: 60 });
			uiBase.append(labelPlus);

			//スタート
			const sprStart = new g.Sprite({ scene: this, src: this.assets["start"], x: 70, y: 100 });
			uiBase.append(sprStart);

			//終了
			const sprFinish = new g.Sprite({ scene: this, src: this.assets["finish"], x: 120, y: 100 });

			uiBase.append(sprFinish);
			//大漁
			const sprTairyou = new g.Sprite({ scene: this, src: this.assets["tairyou"], x: 120, y: 100 });
			uiBase.append(sprTairyou);

			//大量ボーナス用
			const sprTairyou2 = new g.FrameSprite(
				{ scene: this, src: this.assets["tairyou2"] as g.ImageAsset, width: 280, height: 40, frames: [0, 1], x: 160, y: 250 });
			uiBase.append(sprTairyou2);

			//魚群注意
			const sprWarning = new g.Sprite({ scene: this, src: this.assets["warning"], x: 50, y: 100 });
			uiBase.append(sprWarning);

			//リセットボタン
			const btnReset = new Button(this, ["リセット"], 520, 300);
			if (typeof window !== "undefined" && window.RPGAtsumaru) {
				uiBase.append(btnReset);
			}
			btnReset.pushEvent = (ev) => reset();

			//くま
			const sprKuma = new g.FrameSprite({
				scene: this,
				src: this.assets["kuma"] as g.ImageAsset,
				width: 100,
				height: 200,
				frames: [0, 1, 2],
				x: 50,
				y: -20
			});
			bg.append(sprKuma);

			//水面
			const sprLine = new g.FrameSprite({
				scene: this,
				src: this.assets["line"] as g.ImageAsset,
				width: 640,
				height: 20,
				frames: [0, 1],
				interval: 500,
				y: 120
			});
			sprLine.start();
			bg.append(sprLine);

			//針
			let hariCnt = 2;
			const sprHari = new g.E({
				scene: this,
				width: 50,
				height: 130,
				x: 150,
				y: g.game.height - 130
			});
			bg.append(sprHari);

			//糸
			sprHari.append(new g.FilledRect({
				scene: this,
				width: 1,
				height: 350,
				cssColor: "black",
				x: 24,
				y: -243
			}));

			sprHari.append(new g.FilledRect({
				scene: this,
				width: 1,
				height: 350,
				cssColor: "white",
				x: 25,
				y: -243
			}));

			const sprHaris: g.Sprite[] = [];
			for (let i = 0; i < 5; i++) {
				const spr = new g.Sprite({
					scene: this,
					src: this.assets["hari"],
					x: -5,
					y: 100 - (i * 25)
				});
				if (i % 2) spr.scaleX = -1;
				spr.modified();
				sprHaris.push(spr);
				sprHari.append(spr);
			}
			//sprHari.children = [];

			let hariState = 0;
			this.pointDownCapture.add(() => {
				if (!isStart) return;
				if (sprFinish.state === g.EntityStateFlags.None) return;
				if (hariState === 3) hariState = 1;
			});

			//魚
			const sprFishs: Fish[] = [];
			for (let i = 0; i < 6; i++) {
				const sprFish = new Fish(this);
				bg.append(sprFish);
				sprFishs.push(sprFish);
			}

			//メインループ
			let frameCnt = 0;
			const tweens: any = [];
			const handBonus = [3000, 8000, 20000, 5000, 15000, 50000];
			this.update.add(() => {
				if (!isStart) return;

				if (hariState === 1) {
					if (sprHari.y < -80) {
						hariState = 2;
						let num = 0;

						cntHitAll += hitCnt;
						labelNum.text = "" + cntHitAll + "Q";
						labelNum.invalidate();

						//釣れた魚をカウント
						let kurageFlg = false;
						sprFishs.forEach((e: Fish) => {
							if (kurageFlg) return;
							if (e.flg) {
								if (e.num === 5) {
									kurageFlg = true;
									num = 0;
									return;
								}
								num += e.score;
							}
						});

						//釣った魚の情報表示用
						const hash: { [key: number]: number; } = {};
						let singleFlg = true; //１匹ずつしか釣れていない
						let maxHit = 0;//同種最大
						sprFishs.forEach((e: Fish) => {
							if (e.flg) {
								if (hash[e.num]) {
									hash[e.num]++;
									singleFlg = false;
									if (maxHit < hash[e.num]) maxHit = hash[e.num];
								} else {
									hash[e.num] = 1;
								}
							}
						});

						sprFishStates.forEach((e) => e.hide());
						let cnt = 0;
						tweens.forEach((e: any) => {
							timeline.remove(e);
						});
						tweens.length = 0;
						for (let i = 0; i < 17; i++) {
							if (hash[i]) {
								const s = sprFishStates[cnt];
								s.show();
								tweens.push(timeline.create().wait(3000).call(() => s.hide()));
								sprFishNames[cnt].frameNumber = i;
								sprFishNames[cnt].modified();

								labelFishCnts[cnt].text = (hash[i] > 1) ? "*" + hash[i] : "";
								labelFishCnts[cnt].invalidate();
								if (!kurageFlg) {
									labelFishScores[cnt].text = "+" + (Fish.scores[i] * hash[i] * 100);
								} else {
									labelFishScores[cnt].text = "+0";
								}
								labelFishScores[cnt].invalidate();
								cnt++;
							}
						}

						//組み合わせボーナスの表示
						sprHandStates[0].hide();
						if (!kurageFlg) {
							let i = -1;
							if (singleFlg && hitCnt >= 3) {
								i = hitCnt - 3;
							} else if (maxHit >= 3) {
								i = maxHit;
							}
							if (i !== -1) {
								sprHandNames[0].frameNumber = i;
								labelHandScores[0].text = "+" + handBonus[i];
								labelHandScores[0].invalidate();
								sprHandNames[0].modified();
								sprHandStates[0].show();
								tweens.push(timeline.create().wait(3000).call(() => sprHandStates[0].hide()));
								num += handBonus[i];
							}
						}

						//大量
						if (!kurageFlg && hitCnt >= hariCnt) {
							if (hariCnt < 5) {
								sprHaris[hariCnt].show();
								sprTairyou2.frameNumber = 0;
								hariCnt++;
							} else {
								sprTairyou2.frameNumber = 1;
								num += 10000;
							}
							sprTairyou.show();
							timeline.create(
								sprTairyou, {
									modified: sprTairyou.modified, destroyd: sprTairyou.destroyed
								}).wait(1000).call(() => sprTairyou.hide()
								);
							sprTairyou2.modified();
							timeline.create(
								sprTairyou2, {
									modified: sprTairyou2.modified, destroyd: sprTairyou2.destroyed
								}).wait(200).call(() => sprTairyou2.show()).wait(800).call(() => sprTairyou2.hide()
								);
						}

						sprKuma.frameNumber = kurageFlg ? 2 : 1;
						sprKuma.modified();

						sprHari.angle = -30;
						sprHari.modified();

						if (kurageFlg) {
							(this.assets["biri"] as g.AudioAsset).play().changeVolume(0.3);
						} else if (hitCnt !== 0) {
							(this.assets["clear"] as g.AudioAsset).play().changeVolume(0.3);
						} else {
							(this.assets["miss"] as g.AudioAsset).play().changeVolume(0.3);
						}

						addScore(num);
						hitCnt = 0;

						timeline.create(
							sprKuma, {
								modified: sprKuma.modified, destroyd: sprKuma.destroyed
							}).wait(500).call(() => {
								//釣ったあとの処理
								sprKuma.frameNumber = 0;
								hariState = 0;

								sprHari.angle = 0;
								sprHari.modified();

								//釣れた魚をカウントしてリリース
								sprFishs.forEach((e: Fish) => {
									if (e.flg) {
										bg.append(e);
										e.reset();
									}
								});
							});
					}
					sprHari.y -= 10;

					sprFishs.forEach((e) => {
						//針との当たり判定
						if (hariCnt > hitCnt) {
							if (!e.flg && collision(e.collisionArea, sprHari, bg)) {
								e.hit(hitCnt);
								sprHari.append(e);
								hitCnt++;
								(this.assets["move"] as g.AudioAsset).play().changeVolume(0.3);
							}
						}
					});
				} else if (hariState === 0) {
					if (sprHari.y <= g.game.height - sprHari.height) sprHari.y += 10;
					else hariState = 3;
				}

				const t = (70 - Math.floor(frameCnt / 30));
				labelTime.text = "" + t;
				labelTime.invalidate();
				if (t === 0) {
					if (sprFinish.state === g.EntityStateFlags.Hidden) {
						sprFinish.show();
						(this.assets["se_timeup"] as g.AudioAsset).play().changeVolume(0.8);

						timeline.create().wait(3000).call(() => {
							if (typeof window !== "undefined" && window.RPGAtsumaru) {
								window.RPGAtsumaru.experimental.scoreboards.setRecord(1, g.game.vars.gameState.score).then(() => {
									window.RPGAtsumaru.experimental.scoreboards.display(1);
									btnReset.show();
								});
							}
						});
					}
				} else {
					if (t === 10 && Fish.numsCnt < 50) {
						Fish.numsCnt = 50;
					}
					frameCnt++;
				}

			});

			//スコアの追加処理
			const addScore = (num: number) => {
				labelPlus.text = "+" + num;
				labelPlus.invalidate();
				labelPlus.show();
				timeline.create(
					labelPlus, {
						modified: labelPlus.modified, destroyd: labelPlus.destroyed
					}).wait(2000).call(() => labelPlus.hide()
					);
				timeline.create(
					labelScore, {
						modified: labelScore.modified, destroyd: labelScore.destroyed
					}).every((e: number, p: number) => {
						labelScore.text = "" + (score + Math.floor(num * p)) + "P";
						labelScore.invalidate();
					}, 500).call(() => {
						score += num;
						g.game.vars.gameState.score = score;
					});
			};

			//リセット
			const reset = () => {
				sprStart.show();
				sprFinish.hide();
				sprTairyou.hide();
				sprTairyou2.hide();
				sprWarning.hide();
				labelPlus.hide();
				btnReset.hide();
				hariCnt = 2;
				for (let i = hariCnt; i < 5; i++) {
					sprHaris[i].hide();
				}
				timeline.create(
					sprStart, {
						modified: sprStart.modified, destroyd: sprStart.destroyed
					}).wait(2000).call(() => sprStart.hide()
					);

				for (let i = 0; i < 20; i++) {
					if ((i % 10) === 5) {
						Fish.nums[i] = 5;
					} else {
						Fish.nums[i] = random.get(0, 4);
					}
				}

				for (let i = 20; i < 50; i++) {
					Fish.nums[i] = random.get(0, 11);
				}

				for (let i = 50; i < 100; i++) {
					Fish.nums[i] = random.get(6, 16);
				}

				Fish.numsCnt = 0;
				sprFishs.forEach((e) => e.reset());

				score = 0;
				labelScore.text = "0P";
				labelScore.invalidate();

				frameCnt = 0;
				labelTime.text = "70";
				labelTime.invalidate();

				cntHitAll = 0;
				labelNum.text = "0Q";
				labelNum.invalidate();
				isStart = true;

				(this.assets["se_start"] as g.AudioAsset).play().changeVolume(0.8);
			};

			//シンプルな当たり判定。
			//親子関係のみ考慮(拡大、回転があると動かない,シーンには未対応)
			const collision = (e1: g.E, e2: g.E, baseE: g.E) => {
				let x1 = e1.x;
				let y1 = e1.y;
				let e = e1;
				while (true) {
					if (baseE === e || e.parent === undefined) break;
					e = e.parent as g.E;
					x1 += e.x;
					y1 += e.y;
				}
				const w1 = x1 + e1.width;
				const h1 = y1 + e1.height;

				let x2 = e2.x;
				let y2 = e2.y;
				e = e2;
				while (true) {
					if (baseE === e || e.parent === undefined) break;
					e = e.parent as g.E;
					x2 += e.x;
					y2 += e.y;
				}
				const w2 = x2 + e2.width;
				const h2 = y2 + e2.height;
				return (x2 < w1 && x1 < w2 && y2 < h1 && y1 < h2);
			};
		});
	}
}
