"use strict";
var MainScene_1 = require("./MainScene");
function main(param) {
    //const DEBUG_MODE: boolean = true;
    var scene = new MainScene_1.MainScene({ game: g.game });
    g.game.pushScene(scene);
}
module.exports = main;
