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

    playerVelocity: number = 256;

    isTouchUpDown: boolean = false;
    isTouchLeftDown: boolean = false;
    isTouchRightDown: boolean = false;
    isTouchDownDown: boolean = false;

    isUpDown: boolean = false;
    isLeftDown: boolean = false;
    isRightDown: boolean = false;
    isDownDown: boolean = false;

    isPreviousUpDown: boolean = false;
    isPreviousLeftDown: boolean = false;
    isPreviousRightDown: boolean = false;
    isPreviousDownDown: boolean = false;

    character: Character;

    map: Phaser.Tilemaps.Tilemap;
    overworldTileset: Phaser.Tilemaps.Tileset;
    backgroundJuiceLayer: Phaser.Tilemaps.TilemapLayer;
    backgroundCollidersLayer: Phaser.Tilemaps.TilemapLayer;

    constructor ()
    {
        super('Game');
    }

    preload() 
    {
        this.load.image('dpadfull', 'assets/controls/dpadfull.png');

        this.load.image('overworldTiles', 'assets/map/overworld-extruded.png');
        this.load.image('interiorTiles', 'assets/map/interior-extruded.png');
        this.load.tilemapTiledJSON('map', 'assets/map/main.tmj')

        this.load.image('player', 'assets/player.png');

        this.load.spritesheet('characters', 'assets/characters.png', {frameWidth: 16, frameHeight: 16, spacing: 1});
        
    }

    create ()
    {
        super.create();

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);        
        
        this.configureTilemaps();

        // let cols = this.getW() / (TILE_SIZE * this.tilemapScale);
        // let rows = this.getH() / (TILE_SIZE * this.tilemapScale);

        // this.makeGrid(rows, cols);  
          
        this.configurePlayer();
        this.configureInput();      
        
        this.player.setPosition(640, 640);
    }

    update() 
    {   
        this.isPreviousUpDown = this.isUpDown;
        this.isPreviousLeftDown = this.isLeftDown;
        this.isPreviousRightDown = this.isRightDown;
        this.isPreviousDownDown = this.isDownDown;

        this.isUpDown = this.isTouchUpDown || this.cursors!.up.isDown;
        this.isLeftDown = this.isTouchLeftDown || this.cursors!.left.isDown;
        this.isRightDown = this.isTouchRightDown || this.cursors!.right.isDown;
        this.isDownDown = this.isTouchDownDown || this.cursors!.down.isDown;

        let vel: Phaser.Math.Vector2 = new Phaser.Math.Vector2();

        if (this.isUpDown) 
        {
            vel.y = -this.playerVelocity;
        }
        if (this.isDownDown) 
        {
            vel.y = this.playerVelocity;
        }

        if (this.isRightDown) 
        {
            vel.x = this.playerVelocity;
        }
        if (this.isLeftDown) 
        {
            vel.x = -this.playerVelocity;
        }

        vel = vel.normalize().scale(this.playerVelocity);


        if(vel.lengthSq() > 0) {
            console.log(vel);
            this.player.setVelocity(vel.x, vel.y);        
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

        let c = new Character(this, 400, 400).create();
        
        this.cursors = this.input.keyboard?.createCursorKeys();
        Align.scaleToGameW(this.player, TILE_SCALE, this); 
        
        this.backgroundJuiceLayer = this.map.createLayer('above', this.overworldTileset, 0, 0)!;
        this.backgroundCollidersLayer = this.map.createLayer('colliders', this.overworldTileset, 0, 0)!;
        
        this.backgroundJuiceLayer?.setScale(this.tilemapScale, this.tilemapScale);
        this.backgroundCollidersLayer.setScale(this.tilemapScale, this.tilemapScale);

        this.physics.add.collider(this.player, this.backgroundCollidersLayer);
        this.backgroundCollidersLayer.setCollisionByExclusion([-1], true);
    }

    configureTilemaps() {        
        this.map = this.make.tilemap({key: 'map'});
        this.overworldTileset = this.map.addTilesetImage('overworld', 'overworldTiles', 16, 16, 1, 3)!;
        const interior = this.map.addTilesetImage('interior', 'interiorTiles', 16, 16, 1, 3)!;
        let backgroundLayer = this.map.createLayer('ground', this.overworldTileset, 0, 0);
        let sceneryLayer = this.map.createLayer('ground_decoration', this.overworldTileset, 0, 0);        

        this.tilemapScale = (this.getW() * TILE_SCALE) / TILE_SIZE;
        backgroundLayer?.setScale(this.tilemapScale, this.tilemapScale);
        sceneryLayer?.setScale(this.tilemapScale, this.tilemapScale); 


        this.xLimit = this.map.widthInPixels * this.tilemapScale;
        this.yLimit = this.map.heightInPixels * this.tilemapScale;
    }

    configureInput() {

        let dpadTopLeft = {x: this.getW() * .85, y: this.getH() * .05};
        let dpadfull = this.add.image(0, 0, 'dpadfull').setScrollFactor(0);        

        Align.scaleToGameW(dpadfull, 0.18, this);

        let dpadWidth = dpadfull.scaleX * 80;

        console.log(dpadTopLeft);
        console.log(dpadWidth);
        dpadfull.setPosition(dpadTopLeft.x, dpadTopLeft.y + dpadWidth  /2);

        this.add.zone(dpadTopLeft.x, dpadTopLeft.y - 5, dpadWidth / 2, dpadWidth - 10).setInteractive({useHandCursor: true}).setName('controlsUp').setScrollFactor(0);
        this.add.zone(dpadTopLeft.x - dpadWidth / 2 - 5, dpadTopLeft.y + dpadWidth / 2, dpadWidth - 10, dpadWidth / 2).setInteractive({useHandCursor: true}).setName('controlsLeft').setScrollFactor(0);
        this.add.zone(dpadTopLeft.x, dpadTopLeft.y + dpadWidth + 5, dpadWidth / 2, dpadWidth - 10).setInteractive({useHandCursor: true}).setName('controlsDown').setScrollFactor(0);
        this.add.zone(dpadTopLeft.x + dpadWidth / 2 + 5, dpadTopLeft.y + dpadWidth / 2, dpadWidth - 10, dpadWidth / 2).setInteractive({useHandCursor: true}).setName('controlsRight').setScrollFactor(0);

        this.add.zone(dpadTopLeft.x - dpadWidth / 2 - 5, dpadTopLeft.y - 5, dpadWidth - 10, dpadWidth - 10).setInteractive({useHandCursor: true}).setName('controlsUpLeft').setScrollFactor(0);
        this.add.zone(dpadTopLeft.x + dpadWidth / 2 + 5, dpadTopLeft.y - 5, dpadWidth - 10, dpadWidth - 10).setInteractive({useHandCursor: true}).setName('controlsUpRight').setScrollFactor(0);
        this.add.zone(dpadTopLeft.x - dpadWidth / 2 - 5, dpadTopLeft.y + dpadWidth + 5, dpadWidth - 10, dpadWidth - 10).setInteractive({useHandCursor: true}).setName('controlsDownLeft').setScrollFactor(0);
        this.add.zone(dpadTopLeft.x + dpadWidth / 2 + 5, dpadTopLeft.y + dpadWidth + 5, dpadWidth - 10, dpadWidth - 10).setInteractive({useHandCursor: true}).setName('controlsDownRight').setScrollFactor(0);

        // this.add.rectangle(dpadTopLeft.x, dpadTopLeft.y - 5, dpadWidth / 2, dpadWidth - 10, 0xff0000).setScrollFactor(0);
        // this.add.rectangle(dpadTopLeft.x - dpadWidth / 2 - 5, dpadTopLeft.y + dpadWidth / 2, dpadWidth - 10, dpadWidth / 2, 0x00ff00).setScrollFactor(0);
        // this.add.rectangle(dpadTopLeft.x, dpadTopLeft.y + dpadWidth + 5, dpadWidth / 2, dpadWidth - 10, 0x0000ff).setScrollFactor(0);
        // this.add.rectangle(dpadTopLeft.x + dpadWidth / 2 + 5, dpadTopLeft.y + dpadWidth / 2, dpadWidth - 10, dpadWidth / 2, 0xffff00).setScrollFactor(0);

        // this.add.rectangle(dpadTopLeft.x - dpadWidth / 2 - 5, dpadTopLeft.y - 5, dpadWidth - 10, dpadWidth - 10, 0xff00ff).setScrollFactor(0);
        // this.add.rectangle(dpadTopLeft.x + dpadWidth / 2 + 5, dpadTopLeft.y - 5, dpadWidth - 10, dpadWidth - 10, 0x00ffff).setScrollFactor(0);
        // this.add.rectangle(dpadTopLeft.x - dpadWidth / 2 - 5, dpadTopLeft.y + dpadWidth + 5, dpadWidth - 10, dpadWidth - 10, 0x000000).setScrollFactor(0);
        // this.add.rectangle(dpadTopLeft.x + dpadWidth / 2 + 5, dpadTopLeft.y + dpadWidth + 5, dpadWidth - 10, dpadWidth - 10, 0x333333).setScrollFactor(0);
        
        this.input.on('gameobjectover', (pointer: Object, gameObject: Phaser.GameObjects.GameObject) => {

            let name = gameObject.name;

            switch(name) {
                case 'controlsUp':
                    this.isTouchUpDown = true;
                    break;
                case 'controlsDown':
                    this.isTouchDownDown = true;
                    break;
                case 'controlsLeft':
                    this.isTouchLeftDown = true;
                    break;
                case 'controlsRight':
                    this.isTouchRightDown = true;
                    break;
                case 'controlsUpLeft':
                    this.isTouchUpDown = true;
                    this.isTouchLeftDown = true;
                    break;
                case 'controlsUpRight':
                    this.isTouchUpDown = true;
                    this.isTouchRightDown = true;
                    break;
                case 'controlsDownLeft':
                    this.isTouchDownDown = true;
                    this.isTouchLeftDown = true;
                    break;
                case 'controlsDownRight':
                    this.isTouchDownDown = true;
                    this.isTouchRightDown = true;
                    break;
            }
        });

        this.input.on('gameobjectup', (pointer: Object, gameObject: Phaser.GameObjects.GameObject) => {
            this.isTouchUpDown = false;
            this.isTouchLeftDown = false;
            this.isTouchRightDown = false;
            this.isTouchDownDown = false;
        });

        this.input.on('gameobjectout', (pointer: Object, gameObject: Phaser.GameObjects.GameObject) => {
            this.isTouchUpDown = false;
            this.isTouchLeftDown = false;
            this.isTouchRightDown = false;
            this.isTouchDownDown = false;
        });
    }
}
