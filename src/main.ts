import { MainScene } from "./MainScene";
function main(param: g.GameMainParameterObject): void {
	//const DEBUG_MODE: boolean = true;
	const scene = new MainScene({ game: g.game });
	g.game.pushScene(scene);
}
export = main;
