import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';

import { Game, Types } from "phaser";


let requestedHeight = 1024;
let gameRatio = window.innerWidth < window.innerHeight ? window.innerWidth / window.innerHeight : window.innerHeight / window.innerWidth;

let height = requestedHeight > window.innerHeight ? window.innerHeight : requestedHeight;
let width = Math.ceil(height * gameRatio);


//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: width,
    height: height,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        GameOver
    ],
    physics: {
        default: "arcade",
        arcade: {
            debug: true
        }
    }
};

export default new Game(config);
