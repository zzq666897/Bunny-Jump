import Phaser from '../lib/phaser.js'
import Carrot from './Carrot.js';

export default class Game extends Phaser.Scene {


    carrotsCollected = 0;


    constructor() {
        super('Game');

    }


     init()
     {
         this.carrotsCollected = 0;
     }


    preload() {

        this.load.image('carrot', 'assets/carrot.png');
        this.load.image('background', 'assets/bg_layer1.png');
        this.load.image('platform', 'assets/ground_grass.png');
        this.load.image('bunny-stand', 'assets/bunny2_stand.png');
        this.load.image('bunny-jump', 'assets/bunny2_jump.png');
        this.load.audio('jump','audio/phaseJump3.ogg');

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    create() {




        //add background

        this.add.image(240, 320, 'background').
        setScrollFactor(1, 0); // make the background follow the play while scrolling


        //adding text
        const Fontstyle = {
            color: '#f54242',
            fontSize: 24,
        }

        this.carrotsCollectedText = this.add.text(240, 10, 'Carrots: 0', Fontstyle)
            .setScrollFactor(0)
            .setOrigin(0.5, 0);



        this.player = this.physics.add.sprite(240, 320, 'bunny-stand').setScale(0.5); // add player

        this.platforms = this.physics.add.staticGroup();

        // const carrot = new Carrot(this, 240, 320, 'carrot');
        //this.add.existing(carrot);

        this.carrots = this.physics.add.group({
                classType: Carrot
            }


        )

        //this.carrots.get(240, 320, 'carrot');

        //creat five platforms from the group

        for (let i = 0; i < 5; i++) {
            const x = Phaser.Math.Between(80, 400); // random x position from left to right
            const y = 150 * i; // random height --- y postion

            const platform = this.platforms.create(x, y, 'platform');
            platform.scale = 0.5;

            const body = platform.body;
            body.updateFromGameObject();
            //This will refresh the physics body based on any changes we made to the GameObject like position and scale.

        }

        //adding colliders
        this.physics.add.collider(this.platforms, this.player);
        this.physics.add.collider(this.platforms, this.carrots);

        this.physics.add.overlap(
            this.player,
            this.carrots,
            this.handleCollectCarrot,
            undefined,
            this
        )


        //the play will ignore collsions from other direction
        this.player.body.checkCollision.up = false;
        this.player.body.checkCollision.left = false;
        this.player.body.checkCollision.right = false;

        //let the main camera follow the player
        this.cameras.main.startFollow(this.player);

        //let the camera be fixed
        this.cameras.main.setDeadzone(this.scale.width * 1.5)


    }


    update(time, deltatime) {




        this.reUsePlatforms();

        this.handleInputs();

        this.horizontalWrap(this.player);

        this.handleGameOver();

    }

    reUsePlatforms() {
        this.platforms.children.iterate(child => {

            const platform = child

            const scrollY = this.cameras.main.scrollY
            if (platform.y >= scrollY + 700) {
                platform.y = scrollY - Phaser.Math.Between(50, 100)
                platform.body.updateFromGameObject()

                this.addCarrotAbove(platform);
            }
        })
    }



    handleInputs() {
        const touchingDown = this.player.body.touching.down;

        if (touchingDown) {
            this.player.setVelocityY(-300);//jump
            
            this.sound.play('jump');

            this.player.setTexture('bunny-jump')
        }

        if (this.cursors.left.isDown && !touchingDown) {
            this.player.setVelocityX(-200);
        } else if (this.cursors.right.isDown && !touchingDown)

        {
            this.player.setVelocityX(200);
        } else {
            this.player.setVelocityX(0);
        }
        
        const vy = this.player.body.velocity.y;
        if(vy > 0 && this.player.texture.key !== 'bunny-stand')
        {
          this.player.setTexture('bunny-stand');
        }


    }



    // horizontalWrap(sprite) {
    //     const halfwidth = sprite.displayWidth * 0.5;
    //     const gameWidth = this.scale.width
    //     if (sprite.x < -halfwidth) {
    //         sprite.x = gameWidth + halfwidth;
    //     } else if (sprite.x > gameWidth + halfwidth) {
    //         sprite.x = -halfwidth;
    //     }
    // }

    horizontalWrap(sprite) {
        const halfWidth = sprite.displayWidth * 0.5
        const gameWidth = this.scale.width
        if (sprite.x < -halfWidth) {
            sprite.x = gameWidth + halfWidth
        } else if (sprite.x > gameWidth + halfWidth) {
            sprite.x = -halfWidth
        }
    }


    addCarrotAbove(sprite) {
        const y = sprite.y - sprite.displayHeight;

        const carrot = this.carrots.get(sprite.x, y, 'carrot');

        carrot.setActive(true);
        carrot.setVisible(true);

        this.add.existing(carrot);

        carrot.body.setSize(carrot.width, carrot.height);

        this.physics.world.enable(carrot);

        return carrot;
    }

    handleCollectCarrot(player, carrot) {
        this.carrots.killAndHide(carrot);

        this.physics.world.disableBody(carrot.body);

        this.carrotsCollected++;

        //update score

        const value = `Carrots: ${this.carrotsCollected}`;
        this.carrotsCollectedText.text = value;

    }


    findBottomMostPlatform() {

        const platforms = this.platforms.getChildren();

        let bottomPlatform = platforms[0];

        for (let i = 1; i < platforms.length; i++) {
            const platform = platforms[i];

            if (platform.y < bottomPlatform.y) {
                continue
            }

            bottomPlatform = platform;
        }

        return bottomPlatform;


    }

    handleGameOver() {
        const bottomPlatform = this.findBottomMostPlatform()
        if (this.player.y > bottomPlatform.y + 200) {
            console.log('game over')
            this.scene.start('game-over');
        }
    }

}