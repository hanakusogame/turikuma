//魚クラス
export class Fish extends g.E {
	static nums: number[] = new Array(100);
	static numsCnt: number = 0;
	static scores: number[] = [8, 10, 12, 13, 14, 0, 100, 30, 40, 50, 120, 120, 200, 150, 170, 180, 190];
	static escapes: number[] = [1, 1, 1, 1, 1, 50, 50, 50, 50, 50, 50, 80, 80, 80, 80, 80, 80];

	public muki: number = 1;
	public speed: number = 3;
	public hit: (num: number) => void;
	public reset: () => void;
	public score: number = 100;
	public flg: boolean = false;
	public sprImage: g.FrameSprite;
	public collisionArea: g.FilledRect;
	public num: number = 0;

	constructor(scene: g.Scene) {
		super({ scene: scene });

		const anchor = new g.E({ scene: scene });
		this.append(anchor);

		const sprImages: g.FrameSprite[] = [];
		const assetNames = ["fish", "fish2", "ika", "ebi", "kani", "kurage",
			"ningyo", "pengin", "kame", "maguro",
			"same", "iruka", "king", "tako", "siva", "hebi", "robo"];

		for (let i = 0; i < assetNames.length; i++) {
			const image = scene.assets[assetNames[i]] as g.ImageAsset;
			sprImages.push(new g.FrameSprite({
				scene: scene,
				src: image,
				width: image.width,
				height: image.height / 2,
				frames: [0, 1],
				interval: 200
			}));
		}

		this.sprImage = sprImages[0];
		anchor.append(this.sprImage);

		this.collisionArea = new g.FilledRect({ scene: scene, width: 40, height: 40, cssColor: "#000000" });
		this.append(this.collisionArea);
		this.collisionArea.hide();

		let cntLoop = g.game.random.get(0, 30);
		let cntTest = 0;

		this.update.add((ev) => {
			if (!this.flg) {
				if (this.muki === 1 && this.x > g.game.width + (this.sprImage.width/2)) {
					if (g.game.random.get(0, 100) <= Fish.escapes[this.num]) {
						this.reset();
					}
					turn();
				} else if (this.muki === -1 && this.x < -(this.sprImage.width/2)) {
					if (g.game.random.get(0, 100) <= Fish.escapes[this.num]) {
						this.reset();
					}
					turn();
				}
				this.x += (this.speed * this.muki);

				//エビ・イカ(途中でターンする、たまに早く動く)
				if (this.num === 2 || this.num === 3) {
					if ((cntLoop % 20) === 0) {
						cntTest++;
						if ((cntTest % 5) === 0) {
							this.speed = 15;
						} else {
							if (g.game.random.get(0, 1) === 0) {
								turn();
							}
							this.speed = g.game.random.get(2, 12) / 2;
						}
					}
				}

				//マグロ、サメ(たまに早く動く)
				if (this.num === 9 || this.num === 10) {
					if ((cntLoop % 20) === 0) {
						cntTest++;
						if ((cntTest % 5) === 0) {
							this.speed = 15;
						} else {
							this.speed = g.game.random.get(2, 12) / 2;
						}
					}
				}

				//人魚、ペンギン、亀(途中でターンする)
				if (this.num === 6 || this.num === 7 || this.num === 8) {
					if ((cntLoop % 20) === 0) {
						if (g.game.random.get(0, 50) === 0) {
							turn();
						}
					}
				}

				//クラゲ(上下にも動く)
				if (this.num === 5) {
					if (cntTest === 1 && this.y > g.game.height - 50) {
						cntTest = -1;
					} else if (cntTest === -1 && this.y < 150) {
						cntTest = 1;
					}
					this.y += cntTest;
				}

			}
			this.modified();
			cntLoop++;

		});

		const turn = () => {
			this.muki *= -1;
			anchor.scaleX *= -1;

		};

		this.hit = (num: number) => {
			this.flg = true;
			this.x = -this.muki * 20 + 25;
			this.y = 20 * (5 - num);
			anchor.angle = (45 + g.game.random.get(0, 20)) * -this.muki;
			this.modified();
		};

		this.reset = () => {

			if (this.sprImage.parent !== undefined) {
				anchor.remove(this.sprImage);
			}
			this.num = Fish.nums[Fish.numsCnt];
			Fish.numsCnt = (Fish.numsCnt+1)%100;
			this.sprImage = sprImages[this.num];
			anchor.append(this.sprImage);

			this.flg = false;
			this.muki = -1;
			this.score = Fish.scores[this.num] * 100;
			if (this.num === 5) {
				this.speed = 2;//クラゲ
			} else {
				this.speed = g.game.random.get(6, 15) / 2;
			}
			this.x = g.game.width + this.sprImage.width - this.sprImage.x;
			this.y = g.game.random.get(120, g.game.height);
			anchor.scaleX = 1;
			anchor.angle = 0;

			if (this.num === 5) {
				//クラゲ
				this.sprImage.x = -(this.sprImage.width / 2);
				this.sprImage.y = -(this.sprImage.height / 2);
				this.collisionArea.x = -5;
				this.collisionArea.y = -5;
				this.collisionArea.width = 10;
				this.collisionArea.height = 10;
			} else {
				this.sprImage.x = -(this.sprImage.width / 3);
				this.sprImage.y = -(this.sprImage.height / 2);
				this.collisionArea.x = -(this.sprImage.width / 3);
				this.collisionArea.y = -(this.sprImage.height / 2);
				this.collisionArea.width = this.sprImage.width / 1.5;
				this.collisionArea.height = this.sprImage.height;
			}

			cntTest = 1;

			this.sprImage.start();
		};
	}
}
