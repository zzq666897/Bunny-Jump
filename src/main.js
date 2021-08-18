import Phaser from './lib/phaser.js'


//import scenes

import Game from './scenes/game.js'
import GameOver from './scenes/GameOver.js'

export default new Phaser.Game({
    type: Phaser.AUTO,
    width: 480,
    height: 640,
    scene: [Game,GameOver],

    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 200
            },

            debug: true
        }
    }
})