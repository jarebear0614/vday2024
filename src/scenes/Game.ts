//import { Scene } from 'phaser';

import { Align, BaseScene } from 'phaser-utility';

import { Row, VectorPoint, Wheel3D } from 'phaser-ui-tools';

export class Game extends BaseScene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;
    player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;

    xLimit: number = 0;
    yLimit: number = 0;

    playerVelocity: number = 250;

    isUpDown: boolean = false;
    isLeftDown: boolean = false;
    isRightDown: boolean = false;
    isDownDown: boolean = false;

    isPreviousUpDown: boolean = false;
    isPreviousLeftDown: boolean = false;
    isPreviousRightDown: boolean = false;
    isPreviousDownDown: boolean = false;

    constructor ()
    {
        super('Game');
    }

    preload() 
    {
        //controls
        this.load.image('dpadup', 'assets/controls/dpad-up.png');
        this.load.image('dpaddown', 'assets/controls/dpad-down.png');
        this.load.image('dpadleft', 'assets/controls/dpad-left.png');
        this.load.image('dpadright', 'assets/controls/dpad-right.png');

        this.load.image('overworldTiles', 'assets/map/overworld-extruded.png');
        this.load.image('interiorTiles', 'assets/map/interior-extruded.png');
        this.load.tilemapTiledJSON('map', 'assets/map/main.tmj')

        this.load.image('player', 'assets/player.png');
        
    }

    create ()
    {
        super.create();



        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);
        
        const map = this.make.tilemap({key: 'map'});
        const tileset = map.addTilesetImage('overworld', 'overworldTiles', 16, 16, 1, 3)!;
        const interior = map.addTilesetImage('interior', 'interiorTiles', 16, 16, 1, 3)!;
        map.createLayer('background', tileset, 0, 0);
        map.createLayer('backgroundjuice', tileset, 0, 0);
        map.createLayer('scenery', interior, 0, 0);
        //map.createFromObjects

        this.xLimit = map.widthInPixels;
        this.yLimit = map.heightInPixels;

        this.player = this.physics.add.sprite(100, 100, "player");
        this.cursors = this.input.keyboard?.createCursorKeys();
        
        
        this.makeGrid(11, 11);
        this.getGrid().showNumbers();

        this.getGrid().placeAt(2,2, this.player);
        Align.scaleToGameW(this.player, .25, this);

        // this.input.once('pointerdown', () => {

        //     this.scene.start('GameOver');

        // });

        let dpadTopLeft = {x: this.getW() * .10, y: this.getH() * .80};
        let dpadPadding = 0;

        let dpadup = this.add.image(0, 0, "dpadup").setInteractive();
        dpadup.setScrollFactor(0);

        let dpaddown = this.add.image(0, 0, "dpaddown").setInteractive();
        dpaddown.setScrollFactor(0);
        
        let dpadleft = this.add.image(0, 0, "dpadleft").setInteractive();
        dpadleft.setScrollFactor(0);

        let dpadright = this.add.image(0, 0, "dpadright").setInteractive();
        dpadright.setScrollFactor(0);

        Align.scaleToGameW(dpadup, 0.06, this);
        dpaddown.setScale(dpadup.scaleX, dpadup.scaleY);
        dpadleft.setScale(dpadup.scaleX, dpadup.scaleY);
        dpadright.setScale(dpadup.scaleX, dpadup.scaleY);

        dpadup.setX(dpadTopLeft.x + dpadleft.displayWidth + dpadPadding);
        dpadup.setY(dpadTopLeft.y);

        dpaddown.setX(dpadTopLeft.x + dpadleft.displayWidth + dpadPadding);
        dpaddown.setY(dpadTopLeft.y + dpadup.displayHeight + dpadup.displayHeight + dpadPadding);

        dpadleft.setX(dpadTopLeft.x);
        dpadleft.setY(dpadTopLeft.y + dpadup.displayHeight + dpadPadding);

        dpadright.setX(dpadTopLeft.x + dpadleft.displayWidth + dpadleft.displayWidth + dpadPadding);
        dpadright.setY(dpadTopLeft.y + dpadup.displayHeight + dpadPadding);

        dpadup.on('pointerdown', () => {
            console.log('down');
            this.player.setVelocityY(-this.playerVelocity);
        });
        dpadup.on('pointerup', () => {
            console.log('up');
            this.player.setVelocity(0, 0);
        });

        dpaddown.on('pointerdown', () => {
            this.player.setVelocityY(this.playerVelocity);
        });
        dpaddown.on('pointerup', () => {
            this.player.setVelocity(0, 0);
        });

        dpadleft.on('pointerdown', () => {
            this.player.setVelocityX(-this.playerVelocity);
        });
        dpadleft.on('pointerup', () => {
            this.player.setVelocity(0, 0);
        });

        dpadright.on('pointerdown', () => {
            this.player.setVelocityX(this.playerVelocity);
        });
        dpadright.on('pointerup', () => {
            this.player.setVelocity(0, 0);
        });

        //dpadup.addListener("click",)

        



        // this.getGrid().placeAtIndex(100, row, true);
        
        // //Align.scaleToGameW(row, .25, this);
        // let gw = this.getW();
        // let newDisplayWidth = gw * .60;

        // let scale = newDisplayWidth / gw;

        // row.setScale(scale, scale);
    }

    update() 
    {   
        this.isPreviousUpDown = this.isUpDown;
        this.isPreviousLeftDown = this.isLeftDown;
        this.isPreviousRightDown = this.isRightDown;
        this.isPreviousDownDown = this.isDownDown;

        this.isUpDown = this.cursors!.up.isDown;
        this.isLeftDown = this.cursors!.left.isDown;
        this.isRightDown = this.cursors!.right.isDown;
        this.isDownDown = this.cursors!.down.isDown;

        if (this.isUpDown) 
        {
            this.player.setVelocityY(-this.playerVelocity);
        }
        if (this.isDownDown) 
        {
            this.player.setVelocityY(this.playerVelocity);
        }

        if (this.isRightDown) 
        {
            this.player.setVelocityX(this.playerVelocity);
        }
        if (this.isLeftDown) 
        {
            this.player.setVelocityX(-this.playerVelocity);
        }

        if( (!this.isUpDown && this.isPreviousUpDown) ||
            (!this.isLeftDown && this.isPreviousLeftDown) ||
            (!this.isRightDown && this.isPreviousRightDown) ||
            (!this.isDownDown && this.isPreviousDownDown)) {
                this.player.setVelocity(0, 0);
        }

        this.cameras.main.centerOn(this.player.x, this.player.y);      
        this.cameras.main.setBounds(0, 0, this.xLimit, this.yLimit);
    }
}
