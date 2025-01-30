//import { Scene } from 'phaser';

import { Align, BaseScene } from 'phaser-utility';
import { TILE_SCALE, TILE_SIZE } from '../util/const';
import { Character } from '../gameObjects/character';

export class Game extends BaseScene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;
    player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;

    xLimit: number = 0;
    yLimit: number = 0;
    tilemapScale: number = 0;

    playerVelocity: number = 250;

    isUpDown: boolean = false;
    isLeftDown: boolean = false;
    isRightDown: boolean = false;
    isDownDown: boolean = false;

    isPreviousUpDown: boolean = false;
    isPreviousLeftDown: boolean = false;
    isPreviousRightDown: boolean = false;
    isPreviousDownDown: boolean = false;

    character: Character;

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

        this.load.spritesheet('characters', '/assets/characters.png', {frameWidth: 16, frameHeight: 16, spacing: 1});
        
    }

    create ()
    {
        super.create();

        //this.character = new Character(this, 'char1', 50, 50);
        //(<any>this.add).character(this, 200, 200);
        //this.
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);
        
        this.configureTilemaps();

        let cols = this.getW() / (TILE_SIZE * this.tilemapScale);
        let rows = this.getH() / (TILE_SIZE * this.tilemapScale);

        this.makeGrid(rows, cols);

        this.configurePlayer();        
        this.configureInput();

        
        this.getGrid().placeAt(2,2, this.player);
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

    configurePlayer() {
        this.player = this.physics.add.sprite(100, 100, "characters", 0);

        let c = new Character(this, 200, 200);
        c.create();
        
        this.cursors = this.input.keyboard?.createCursorKeys();
        Align.scaleToGameW(this.player, TILE_SCALE, this);
    }

    configureTilemaps() {        
        const map = this.make.tilemap({key: 'map'});
        const tileset = map.addTilesetImage('overworld', 'overworldTiles', 16, 16, 1, 3)!;
        const interior = map.addTilesetImage('interior', 'interiorTiles', 16, 16, 1, 3)!;
        let backgroundLayer = map.createLayer('background', tileset, 0, 0);
        let backgroundJuiceLayer = map.createLayer('backgroundjuice', tileset, 0, 0);
        let sceneryLayer = map.createLayer('scenery', interior, 0, 0);        

        this.tilemapScale = (this.getW() * TILE_SCALE) / TILE_SIZE;
        backgroundLayer?.setScale(this.tilemapScale, this.tilemapScale);
        backgroundJuiceLayer?.setScale(this.tilemapScale, this.tilemapScale);
        sceneryLayer?.setScale(this.tilemapScale, this.tilemapScale); 

        this.xLimit = map.widthInPixels * this.tilemapScale;
        this.yLimit = map.heightInPixels * this.tilemapScale;
    }

    configureInput() {

        let dpadTopLeft = {x: this.getW() * .10, y: this.getH() * .80};
        let dpadPadding = 0;

        let dpadup = this.add.image(0, 0, "dpadup").setInteractive({ useHandCursor: true }).setScrollFactor(0);
        let dpaddown = this.add.image(0, 0, "dpaddown").setInteractive({ useHandCursor: true }).setScrollFactor(0);        
        let dpadleft = this.add.image(0, 0, "dpadleft").setInteractive({ useHandCursor: true }).setScrollFactor(0);
        let dpadright = this.add.image(0, 0, "dpadright").setInteractive({ useHandCursor: true }).setScrollFactor(0);

        Align.scaleToGameW(dpadup, TILE_SCALE, this);
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
            this.player.setVelocityY(-this.playerVelocity);
        });
        dpadup.on('pointerup', () => {
            this.player.setVelocity(0, 0);
        });
        dpadup.on('pointerout', () => {
            this.player.setVelocity(0, 0);
        });

        dpaddown.on('pointerdown', () => {
            this.player.setVelocityY(this.playerVelocity);
        });
        dpaddown.on('pointerup', () => {
            this.player.setVelocity(0, 0);
        });        
        dpaddown.on('pointerout', () => {
            this.player.setVelocity(0, 0);
        });

        dpadleft.on('pointerdown', () => {
            this.player.setVelocityX(-this.playerVelocity);
        });
        dpadleft.on('pointerup', () => {
            this.player.setVelocity(0, 0);
        });
        dpadleft.on('pointerout', () => {
            this.player.setVelocity(0, 0);
        });

        dpadright.on('pointerdown', () => {
            this.player.setVelocityX(this.playerVelocity);
        });
        dpadright.on('pointerup', () => {
            this.player.setVelocity(0, 0);
        });
        dpadright.on('pointerout', () => {
            this.player.setVelocity(0, 0);
        });

    }
}
