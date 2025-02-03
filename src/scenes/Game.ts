import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

import { TILE_SCALE, TILE_SIZE } from '../util/const';
import { Character } from '../gameObjects/character';
import { BaseScene } from './BaseScene';
import { Align } from '../util/align';
import { GameState } from '../gameObjects/GameState';
import { Player } from '../gameObjects/player';
import { Interactive } from '../gameObjects/interactive';
import { CharacterEvent, CharacterEventUtility, EndAction, EventKeyCondition } from '../gameObjects/dialog';

export class Game extends BaseScene
{
    rexUI: RexUIPlugin;
    dialog: RexUIPlugin.Dialog | null;

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

    interactKey: Phaser.Input.Keyboard.Key | undefined;

    isInteractKeyDown: boolean = false;
    isPreviousInteractKeyDown: boolean = false;

    map: Phaser.Tilemaps.Tilemap;
    overworldTileset: Phaser.Tilemaps.Tileset;
    backgroundJuiceLayer: Phaser.Tilemaps.TilemapLayer;
    backgroundCollidersLayer: Phaser.Tilemaps.TilemapLayer;

    currentInteractiveObject: Interactive | null = null;

    eventKey: number = 0;

    characterEvents: Character[] = [];

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
        this.load.image('interact', 'assets/controls/A.png');

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
        this.configureInteractiveObjects();
        this.configureCharacterObjects();
        
        let playerXSpawn = TILE_SIZE * this.tilemapScale * (this.gameState.spawnX ?? 10);
        let playerYSpawn = TILE_SIZE * this.tilemapScale * (this.gameState.spawnY ?? 10);

        this.player.setPosition(playerXSpawn, playerYSpawn);

        this.configureEvent();
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

        if(this.interactKey)
        {
            this.isPreviousInteractKeyDown = this.isInteractKeyDown;
            this.isInteractKeyDown = this.interactKey.isDown;
        }

        if(!this.isPreviousInteractKeyDown && this.isInteractKeyDown)
        {
            if(this.currentInteractiveObject !== null)
            {
                this.showDialog(this.currentInteractiveObject.messages, !!this.currentInteractiveObject.title, this.currentInteractiveObject.title);
            }
        }

        let touching = !this.player.body.body.touching.none;
        let wasTouching = !this.player.body.body.wasTouching.none;

        if(wasTouching && !touching) 
        {
            this.currentInteractiveObject = null;
        }
    }

    private configurePlayer() {
        this.player = new Player(this, 100, 100, 'Megan');
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

    private configureInteractiveObjects() 
    {
        let interactiveObjects = this.map.getObjectLayer('map_interactive')!.objects;

        for(const interactive of interactiveObjects) 
        {
            const {x, y, width, height, properties } = interactive;

            let message: string = '';

            for (const property of properties) {
                switch (property.name) {
                    case 'message':
                        message = property.value;
                        break;
                }
            }

            let sprite = this.physics.add.sprite(x! * this.tilemapScale, y! * this.tilemapScale, 'transparent').setOrigin(0, 0);
            sprite.body.setSize(width, height, false);
            Align.scaleToGameWidth(sprite, TILE_SCALE, this);

            this.physics.add.overlap(this.player.body, sprite, () => 
            {
                this.currentInteractiveObject = new Interactive([message]);
            });
        }
    }

    private configureCharacterObjects() 
    {
        let characterObjects = this.map.getObjectLayer('map_character')!.objects;

        for(const character of characterObjects) 
        {
            const {x, y, width, height, name, properties } = character;

            let dialog: CharacterEvent = null!;
            
            let bodyFrame: number = 0;
            let hairFrame: number = 0;
            let shirtFrame: number = 0;
            let pantsFrame: number = 0;
            let shoesFrame: number = 0;
            let eventKeyTrigger: number = 0;
            let eventKeyEnd: number = 0;

            for (const property of properties) {
                switch (property.name) {
                    case 'bodyFrame':
                        bodyFrame = parseInt(property.value);
                        break;
                    case 'hairFrame':
                        hairFrame = parseInt(property.value);
                        break;
                    case 'shirtFrame':
                        shirtFrame = parseInt(property.value);
                        break;
                    case 'pantsFrame':
                        pantsFrame = parseInt(property.value);
                        break;
                    case 'shoesFrame':
                        shoesFrame = parseInt(property.value);
                        break;
                    case 'dialog':
                        dialog = JSON.parse(property.value.toString());
                        break;
                    case 'eventKeyTrigger':
                        eventKeyTrigger = parseInt(property.value);
                        break;
                    case 'eventKeyEnd':
                        eventKeyEnd = parseInt(property.value);
                        break;
                }
            }
            let newCharacter = new Character(this, x! * this.tilemapScale, y! * this.tilemapScale, name, 
            {
                bodyFrame: bodyFrame,
                hairFrame: hairFrame,
                shirtFrame: shirtFrame,
                pantsFrame: pantsFrame,
                shoesFrame: shoesFrame,
                eventKey: eventKeyTrigger,
                eventKeyEnd: eventKeyEnd,
                dialog: dialog,
                player: this.player.getBody(),
                overlapCallback: () => {
                    let ev = CharacterEventUtility.findEventByKey(dialog, this.eventKey);

                    if(ev !== undefined)
                    {
                        this.currentInteractiveObject = new Interactive(ev.dialog, ev.onEnd, name);
                    }
                }
            });

            this.characterEvents.push(newCharacter);
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
        
        let interactButton = this.add.image(this.getGameWidth() * 0.85, this.getGameHeight() * 0.20, 'interact').setInteractive({useHandCursor: true}).setScrollFactor(0);

        Align.scaleToGameWidth(dpadfull, 0.18, this);
        Align.scaleToGameWidth(interactButton, 0.18, this);

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
        
        interactButton.on('pointerup', () => {
            if(this.currentInteractiveObject !== null)
            {
                this.showDialog(this.currentInteractiveObject.messages, !!this.currentInteractiveObject.title, this.currentInteractiveObject.title);
            }
        });

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

        this.interactKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }

    private showDialog(messages: string[], showTitle: boolean = false, title: string = '')
    {             
        if(this.dialog != null) 
        {
            return;
        }

        let messagesIndex = 0;

        this.dialog = this.rexUI.add.dialog({
            x: this.getGameWidth() * 0.10 + (this.getGameWidth() * 0.85) / 2,
            y: this.getGameHeight() * 0.80,
            width: this.getGameWidth() * 0.85,

            background: this.rexUI.add.roundRectangle(0, 0, 40, 100, 20, 0xA1A05E),
            title: !showTitle ? undefined : this.rexUI.add.label({
                background: this.rexUI.add.roundRectangle(0, 0, 40, 40, 20, 0xC1BA71),
                text: this.add.text(0, 0, title, {fontSize: '24px'}),
                space: {
                    left: 10,
                    right: 10,
                    top: 10,
                    bottom: 10
                }
            }),

            // toolbar: [
            //     this.rexUI.add.label({
            //         background: this.rexUI.add.roundRectangle(0, 0, 40, 40, 20, 0xC1BA71),
            //         text: this.add.text(0, 0, 'X'),
            //         space: {
            //             left: 10,
            //             right: 10,
            //             top: 10,
            //             bottom: 10
            //         }
            //     })
            // ],

            content: this.add.text(0, 0, messages[messagesIndex]),

            actions: [this.rexUI.add.label({
                background: this.rexUI.add.roundRectangle(0, 0, 40, 40, 20, 0xC1BA71),
                text: this.add.text(0, 0, messages.length > 1 ? 'Next' : 'Close'),
                space: {
                    left: 10,
                    right: 10,
                    top: 10,
                    bottom: 10
                }
            })],

            space: {
                left: 20,
                right: 20,
                top: -20,
                bottom: 20,

                title: 25,
                content: 25,
                description: 25,
                descriptionLeft: 20,
                descriptionRight: 20,
                choices: 25,

                toolbarItem: 5,
                choice: 15,
                action: 15,
            },

            expand:
            {
                content: true,
                title: false
            },

            align: {
                title: 'left',
                actions: 'right'
            },

            click: {
                mode: 'release'
            }
        }).layout().setScrollFactor(0).popUp(1000);

        this.dialog
            .on('button.click', (button: any, groupName: string, index: number, pointer: Phaser.Input.Pointer, event: Event) => 
            {
                if(groupName === 'actions')
                {
                    messagesIndex = messagesIndex + 1;

                    if(messagesIndex == messages.length - 1)
                    {
                        let actions = this.dialog?.getElement('actions') as RexUIPlugin.Label[];
                        actions[0].text = "Close";
                        this.dialog?.layout();
                    }
                    else if(messagesIndex == messages.length) 
                    {
                        this.dialog?.scaleDownDestroy(300);
                        this.dialog = null;

                        if(this.currentInteractiveObject?.endAction == EndAction.incrementEvent) 
                        {
                            this.incrementEvent();
                        }
                        this.currentInteractiveObject = null;
                        return;
                    }

                    let text = this.dialog?.getElement('content') as Phaser.GameObjects.Text;
                    text.text = messages[messagesIndex];
                    
                    return;
                }

                this.dialog?.scaleDownDestroy(300);
                this.dialog = null;
            })
            .on('button.over', function (button: any, groupName: string, index: number, pointer: Phaser.Input.Pointer, event: Event) 
            {
                button.getElement('background').setStrokeStyle(1, 0xffffff);
            })
            .on('button.out', function (button: any, groupName: string, index: number, pointer: Phaser.Input.Pointer, event: Event) 
            {
                button.getElement('background').setStrokeStyle();
            });            
    }

    private configureEvent() 
    {
        for(let character of this.characterEvents)
        {
            let trigger = character.getEventKeyTrigger();
            let end = character.getEventKeyEnd();

            if(this.eventKey >= trigger && this.eventKey <= end && !character.isCreated())
            {
                character.create();
            }
        }
    }

    private incrementEvent() 
    {
        this.eventKey++;

        let charactersToRemove: number[] = [];

        for(let i = 0; i < this.characterEvents.length; ++i)
        {
            let character = this.characterEvents[i];
            let end = character.getEventKeyEnd();

            if(this.eventKey >= end && character.isCreated())
            {
                character.tearDown();
                charactersToRemove.push(i);
            }
        }

        for(let character of charactersToRemove)
        {
            this.characterEvents.splice(character, 1);
        }

        this.configureEvent();
    }
}
