import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

import { TILE_SCALE, TILE_SIZE } from '../util/const';
import { Character } from '../gameObjects/character';
import { BaseScene } from './BaseScene';
import { Align } from '../util/align';
import { GameState } from '../gameObjects/GameState';
import { Player } from '../gameObjects/player';

export class Game extends BaseScene
{
    rexUI: RexUIPlugin;

    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;
    player: Player;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;

    gameState: GameState = new GameState();

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


    init(data: any) 
    {
        this.cameras.main.fadeOut(1);
        if(data && data.gameState && data.gameState instanceof GameState) 
        {
            this.gameState = data.gameState;
        }

        this.load.on('progress', (progress: number) => 
        {
            if(progress >= 1) 
            {
                this.cameras.main.fadeIn(300);
            }

        });
    }

    preload() 
    {
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });    

        this.load.image('transparent', 'assets/transparent.png');

        this.load.image('dpadfull', 'assets/controls/dpadfull.png');

        this.load.image('overworldTiles', 'assets/map/overworld-extruded.png');
        this.load.image('interiorTiles', 'assets/map/interior-extruded.png');
        this.load.tilemapTiledJSON('main', 'assets/map/main.tmj')
        this.load.tilemapTiledJSON('meganshouse', 'assets/map/meganshouse.tmj');

        this.load.image('player', 'assets/player.png');

        this.load.spritesheet('characters', 'assets/characters.png', {frameWidth: 16, frameHeight: 16, spacing: 1});
        
    }

    create ()
    {
        super.create();

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);   
        
        this.configureTilemaps();          
        this.configurePlayer();
        this.configureInput();
        this.configureTransportMapObjects();
        
        let playerXSpawn = TILE_SIZE * this.tilemapScale * (this.gameState.spawnX ?? 10);
        let playerYSpawn = TILE_SIZE * this.tilemapScale * (this.gameState.spawnY ?? 10);

        this.player.setPosition(playerXSpawn, playerYSpawn);       

        // this.rexUI.add.dialog({
        //     x: this.getGameWidth() * 0.10 + (this.getGameWidth() * 0.85) / 2,
        //     y: this.getGameHeight() * 0.80,
        //     width: this.getGameWidth() * 0.85,

        //     background: this.rexUI.add.roundRectangle(0, 0, 40, 100, 20, 0xA1A05E),
        //     title: this.rexUI.add.label({
        //         background: this.rexUI.add.roundRectangle(0, 0, 40, 40, 20, 0xC1BA71),
        //         text: this.add.text(0, 0, 'Jared', {fontSize: '24px'}),
        //         space: {
        //             left: 10,
        //             right: 10,
        //             top: 10,
        //             bottom: 10
        //         }
        //     }),

        //     content: this.add.text(0, 0, 'Stop trying to fuck my dad.'),

        //     space: {
        //         left: 20,
        //         right: 20,
        //         top: -20,
        //         bottom: 20,

        //         title: 25,
        //         content: 25,
        //         description: 25,
        //         descriptionLeft: 20,
        //         descriptionRight: 20,
        //         choices: 25,

        //         toolbarItem: 5,
        //         choice: 15,
        //         action: 15,
        //     },

        //     expand:
        //     {
        //         content: true
        //     },

        //     align: {
        //         title: 'center'
        //     }
        // }).layout().setScrollFactor(0).popUp(1000);
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
            this.player.setVelocity(vel.x, vel.y);        
        }

        if( (!this.isUpDown && this.isPreviousUpDown) ||
            (!this.isLeftDown && this.isPreviousLeftDown) ||
            (!this.isRightDown && this.isPreviousRightDown) ||
            (!this.isDownDown && this.isPreviousDownDown)) {
                this.player.setVelocity(0, 0);
        }

        this.cameras.main.centerOn(this.player.getX(), this.player.getY());      
        this.cameras.main.setBounds(0, 0, this.xLimit, this.yLimit);

        this.player.update();
    }

    private configurePlayer() {
        this.player = new Player(this, 100, 100);
        this.player.create();
        
        this.cursors = this.input.keyboard?.createCursorKeys();
        
        this.backgroundJuiceLayer = this.map.createLayer('above', this.overworldTileset, 0, 0)!;
        this.backgroundCollidersLayer = this.map.createLayer('colliders', this.overworldTileset, 0, 0)!;
        let aboveDecorationLayer = this.map.createLayer('above_decoration_1', this.overworldTileset, 0, 0)!;
        let aboveDecorationLayer2 = this.map.createLayer('above_decoration_2', this.overworldTileset, 0, 0)!;
        
        this.backgroundJuiceLayer?.setScale(this.tilemapScale, this.tilemapScale);
        this.backgroundCollidersLayer.setScale(this.tilemapScale, this.tilemapScale);
        aboveDecorationLayer.setScale(this.tilemapScale, this.tilemapScale);
        aboveDecorationLayer2.setScale(this.tilemapScale, this.tilemapScale);

        this.physics.add.collider(this.player.getBody(), this.backgroundCollidersLayer);
        this.backgroundCollidersLayer.setCollisionByExclusion([-1], true);
    }

    private configureTransportMapObjects() {
        let transportObjects = this.map.getObjectLayer('map_transport')!.objects;

        for (const transportTile of transportObjects) {
            const { x, y, width, height, properties } = transportTile;

            console.log(transportTile);
            console.log(properties);

            let gameState = new GameState();

            for (const property of properties) {
                switch (property.name) {
                    case 'to_map':
                        gameState.tilemap = property.value;
                        break;
                    case 'map_spawn_x':
                        gameState.spawnX = parseInt(property.value);
                        break;
                    case 'map_spawn_y':
                        gameState.spawnY = parseInt(property.value);
                        break;
                }
            }

            let sprite = this.physics.add.sprite(x! * this.tilemapScale, y! * this.tilemapScale, 'transparent').setOrigin(0, 0);
            sprite.body.setSize(width, height, false);
            Align.scaleToGameWidth(sprite, TILE_SCALE, this);

            let collider = this.physics.add.overlap(this.player.getBody(), sprite, () => {
                this.camera.fadeOut(300);

                this.physics.world.removeCollider(collider);

                this.time.delayedCall(300, () => {
                    this.scene.restart({
                        gameState: gameState
                    });
                });
            });
        }
    }

    private configureTilemaps() {        
        this.map = this.make.tilemap({key: this.gameState.tilemap ?? 'map'});
        this.overworldTileset = this.map.addTilesetImage('overworld', 'overworldTiles', 16, 16, 1, 3)!;
       // const interior = this.map.addTilesetImage('interior', 'interiorTiles', 16, 16, 1, 3)!;
        let backgroundLayer = this.map.createLayer('ground', this.overworldTileset, 0, 0);
        let groundDecorationLayer = this.map.createLayer('ground_decoration', this.overworldTileset, 0, 0);        

        this.tilemapScale = (this.getGameWidth() * TILE_SCALE) / TILE_SIZE;
        backgroundLayer?.setScale(this.tilemapScale, this.tilemapScale);
        groundDecorationLayer?.setScale(this.tilemapScale, this.tilemapScale); 

        this.xLimit = this.map.widthInPixels * this.tilemapScale;
        this.yLimit = this.map.heightInPixels * this.tilemapScale;
    }

    private configureInput() {

        let dpadTopLeft = {x: this.getGameWidth() * .85, y: this.getGameHeight() * .05};
        let dpadfull = this.add.image(0, 0, 'dpadfull').setScrollFactor(0);        

        Align.scaleToGameWidth(dpadfull, 0.18, this);

        let dpadWidth = dpadfull.scaleX * 80;
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
