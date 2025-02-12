import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

import { TILE_SCALE, TILE_SIZE } from '../util/const';
import { Character } from '../gameObjects/character';
import { BaseScene } from './BaseScene';
import { Align } from '../util/align';
import { GameState } from '../gameObjects/GameState';
import { Player } from '../gameObjects/player';
import { Interactive, InteractiveConfig, InteractiveTriggerConfig, SceneTransitionConfig } from '../gameObjects/interactive';
import { CharacterEvent, CharacterEventUtility, EndAction, OverlapAction } from '../gameObjects/dialog';
import { RandomInRadiusCharacterMovement, CharacterMovementConfig, WaypointCharacterMovement, NopCharacterMovement } from '../gameObjects/CharacterMovementComponents';
import { ICharacterMovement } from '../gameObjects/ICharacterMovement';
import { GameEventManager} from '../gameObjects/GameEvent';



export class Game extends BaseScene
{
    rexUI: RexUIPlugin;
    dialog: RexUIPlugin.Dialog | null;

    camera: Phaser.Cameras.Scene2D.Camera;
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
    interiorTileset: Phaser.Tilemaps.Tileset;
    backgroundAboveLayer: Phaser.Tilemaps.TilemapLayer;
    backgroundCollidersLayer: Phaser.Tilemaps.TilemapLayer;

    currentInteractiveObject: Interactive | null = null;

    gameEventManager: GameEventManager = new GameEventManager();

    lyricCountText: Phaser.GameObjects.Text;
    interactText: Phaser.GameObjects.Text;

    playerTouching: boolean = false;
    wasPlayerTouching: boolean = false;

    currentItem: Phaser.GameObjects.Image | null;

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

        this.currentInteractiveObject = null;

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

        this.load.image('lyricPieces', 'assets/paper.png');
        this.load.image('Shovel', 'assets/shovel_silver.png');
        this.load.image('Ring', 'assets/ring.png');
    }

    create ()
    {
        super.create();

        this.gameEventManager.purgeCharactersFromEvents();

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

        if(this.gameState.fromScene === "Tetris")
        {
            if(this.gameEventManager.getCurrentEventProgress("tetris") === 1 && (this.gameState.tetrisScore ?? 0) >= 5000)
            {
                this.gameEventManager.incrementEvent("tetris");
                this.showDialog(['I better go talk to bob, I beat the high score!'], 
                {
                    endAction: EndAction.incrementEvent
                });
            }
        }
        
        if(this.gameState.fromScene === "Dots")
        {
            if(this.gameEventManager.getCurrentEventProgress("dots") === 0 && this.gameState.completedDots)
            {
                this.gameEventManager.incrementEvent('dots');
                this.showDialog(['Ahh I feel better now', 'Wait, what\'s this?', 'Oh, a lyric piece!'], 
                {
                    eventName: 'dots',
                    endAction: EndAction.giveLyricPiece
                });
            }
        }

        if(this.gameState.fromScene === "Hangman")
        {
            if(this.gameEventManager.getCurrentEventProgress("hangman") === 0 && this.gameState.completedHangman)
            {
                this.showDialog(['You got a lyric piece!'], 
                {
                    eventName: 'hangman',
                    endAction: EndAction.giveLyricPiece
                });
            }
        }

        this.configureLyricUI();
    }

    update(_: number, delta: number) 
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

        this.player.update(delta);

        if(this.interactKey)
        {
            this.isPreviousInteractKeyDown = this.isInteractKeyDown;
            this.isInteractKeyDown = this.interactKey.isDown;
        }

        if(!this.isPreviousInteractKeyDown && this.isInteractKeyDown)
        {
            this.triggerInteractiveEvent({
                type: this.currentInteractiveObject?.type ?? 'sign',
                interactive: this.currentInteractiveObject,
                scene: this.currentInteractiveObject?.sceneTransition
            });
        }

        this.wasPlayerTouching = this.playerTouching;
        this.playerTouching = this.player.body.body.embedded;
        
        if(this.wasPlayerTouching && !this.playerTouching) 
        {
            this.currentInteractiveObject?.sourceCharacter?.movement?.unpause();
            this.currentInteractiveObject = null;
        }

        let events = this.gameEventManager.getCurrentGameEvents();
        for(let ev of events)
        {
            ev.update(delta);
        }

        if(this.currentInteractiveObject && !this.interactText.visible)
        {
            this.interactText.setVisible(true);
        }
        else if(this.currentInteractiveObject == null && this.interactText.visible)
        {
            this.interactText.setVisible(false);
        }
    }

    private configurePlayer() {
        this.player = new Player(this, 100, 100, 'Megan');
        this.player.create();
        
        this.cursors = this.input.keyboard?.createCursorKeys();
        
        
        this.backgroundCollidersLayer = this.map.createLayer('colliders', [this.overworldTileset, this.interiorTileset], 0, 0)!;
        this.backgroundAboveLayer = this.map.createLayer('above', [this.overworldTileset, this.interiorTileset], 0, 0)!;
        let aboveDecorationLayer = this.map.createLayer('above_decoration_1', [this.overworldTileset, this.interiorTileset], 0, 0)!;
        let aboveDecorationLayer2 = this.map.createLayer('above_decoration_2', [this.overworldTileset, this.interiorTileset], 0, 0)!;
        
        this.backgroundAboveLayer?.setScale(this.tilemapScale, this.tilemapScale);
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

            let tilemap : string | undefined;
            let spawnX: number | undefined;
            let spawnY: number | undefined;

            for (const property of properties) {
                switch (property.name) {
                    case 'to_map':
                        tilemap = property.value;
                        break;
                    case 'map_spawn_x':
                        spawnX = parseInt(property.value);
                        break;
                    case 'map_spawn_y':
                        spawnY = parseInt(property.value);
                        break;
                }
            }

            let sprite = this.physics.add.sprite(x! * this.tilemapScale, y! * this.tilemapScale, 'transparent').setOrigin(0, 0);
            sprite.body.setSize(width, height, false);
            Align.scaleToGameWidth(sprite, TILE_SCALE, this);

            let collider = this.physics.add.overlap(this.player.getBody(), sprite, () => {
                
                this.gameState.tilemap = tilemap;
                this.gameState.spawnX = spawnX;
                this.gameState.spawnY = spawnY;
                this.gameState.fromScene = this.scene.key;

                this.camera.fadeOut(300);

                this.physics.world.removeCollider(collider);

                this.time.delayedCall(300, () => {
                    this.gameEventManager.purgeCharactersFromEvents();
                    this.scene.restart({ gameState: this.gameState });
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
            let type: string = interactive.type;

            let toScene: string | undefined;
            let fromX: number = 0;
            let fromY: number = 0;

            let eventName: string | undefined;
            let eventKeyTrigger: number | undefined;
            let eventKeyEnd: number | undefined;

            let dialog: CharacterEvent | undefined = undefined;

            let item: string | undefined;

            if(properties)
            {
                for (const property of properties) {
                    switch (property.name) {
                        case 'message':
                            message = property.value;
                            break;
                        case 'to_scene':
                            toScene = property.value;
                            break;
                        case 'fromX':
                            fromX = parseInt(property.value);
                            break;
                        case 'fromY':
                            fromY = parseInt(property.value);
                            break;
                        case 'eventName':
                            eventName = property.value;
                            break;
                        case 'eventKeyTrigger':
                            eventKeyTrigger = parseInt(property.value);
                            break;
                        case 'eventKeyEnd':
                            eventKeyEnd = parseInt(property.value);
                            break;
                        case 'dialog':
                            dialog = JSON.parse(property.value);
                            break;
                        case 'item':
                            item = property.value;
                            break;
                    }
                }
            }

            let sprite = this.physics.add.sprite(x! * this.tilemapScale, y! * this.tilemapScale, 'transparent').setOrigin(0, 0);
            sprite.body.setSize(width, height, false);
            Align.scaleToGameWidth(sprite, TILE_SCALE, this);

            if(eventName && eventKeyTrigger)
            {
                this.gameEventManager.addEvent(eventName, eventKeyTrigger);
            }

            this.physics.add.overlap(this.player.body, sprite, () => 
            {
                let progress = Number.MAX_SAFE_INTEGER;
                if(eventName)
                {
                    progress = this.gameEventManager.getCurrentEventProgress(eventName);
                }

                if(dialog)
                {
                    let current = dialog?.events.find((ev) =>
                    {
                        return ev.eventKey == progress;
                    });

                    if(current)
                    {
                        this.currentInteractiveObject = new Interactive(current.dialog, 'sign', eventName, current.eventKey, 
                            {
                                endAction: current.onEnd,
                                grantedItem: item,
                                sceneTransition: {
                                    toScene: toScene ?? '',
                                    fromX: fromX,
                                    fromY: fromY
                                }
                            },
                        );   
                    }
                }
                
                if((!eventKeyTrigger && !eventKeyEnd) || progress >= (eventKeyTrigger ?? 0) && progress < (eventKeyEnd ?? 5000))
                {
                    if(!this.currentInteractiveObject)
                    {
                        this.currentInteractiveObject = new Interactive([message], type, eventName, eventKeyTrigger, {
                            grantedItem: item,
                            sceneTransition: {
                                toScene: toScene ?? '',
                                fromX: fromX,
                                fromY: fromY
                            }
                        });
                    }
                }
            });

            if(eventName && eventKeyTrigger != undefined)
            {
                this.gameEventManager.addEvent(eventName, eventKeyTrigger);
            }
        }
    }

    private configureCharacterObjects() 
    {
        let characterObjects = this.map.getObjectLayer('map_character')!.objects;
        let characters: Character[] = [];

        for(const character of characterObjects) 
        {
            const {x, y, name, properties, type } = character;

            let dialog: CharacterEvent = null!;
            
            let bodyFrame: number = 0;
            let hairFrame: number = 0;
            let shirtFrame: number = 0;
            let pantsFrame: number = 0;
            let shoesFrame: number = 0;
            let eventName: string = 'test';
            let eventKeyTrigger: number = 0;
            let eventKeyEnd: number = 0;
            let instance: string = '';
            let movement: CharacterMovementConfig = new CharacterMovementConfig();

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
                    case 'eventName':
                        eventName = property.value;
                        break;
                    case 'eventKeyTrigger':
                        eventKeyTrigger = parseInt(property.value);
                        break;
                    case 'eventKeyEnd':
                        eventKeyEnd = parseInt(property.value);
                        break;
                    case 'instance':
                        instance = property.value;
                        break;
                    case 'movement':
                        movement = JSON.parse(property.value.toString());
                        break;
                }
            }

            let possibleExistingCharacter = characters.find((c) =>
            {
                return c.name == name && c.config.instance == instance;
            });

            let newCharacter = possibleExistingCharacter ? possibleExistingCharacter : new Character(this, x! * this.tilemapScale, y! * this.tilemapScale, name, 
            {
                bodyFrame: bodyFrame,
                hairFrame: hairFrame,
                shirtFrame: shirtFrame,
                pantsFrame: pantsFrame,
                shoesFrame: shoesFrame,
                eventKey: eventKeyTrigger,
                eventKeyEnd: eventKeyEnd,
                eventName: eventName,
                instance: instance,
                dialog: dialog,
                player: this.player.getBody(),
                overlapCallback: () => {
                    newCharacter.movement?.pause();
                    let ev = this.gameEventManager.getCurrentEventProgress(eventName);
                    if(ev !== undefined)
                    {
                        let messages = CharacterEventUtility.findEventByKey(dialog, ev);
                        if(messages !== undefined)
                        {
                            if(ev >= eventKeyTrigger)
                            {
                                this.currentInteractiveObject = new Interactive(messages.dialog, type, eventName, eventKeyTrigger, {
                                    title: name,
                                    endAction: messages.onEnd,
                                    sourceCharacter: newCharacter,
                                    grantedItem: messages.item,
                                    sceneTransition: messages.scene ? {
                                        toScene: messages.scene,
                                        fromX: messages.fromX,
                                        fromY: messages.fromY
                                    } : undefined
                                });

                                if(messages.overlapAction == OverlapAction.autoTrigger)
                                {
                                    this.triggerInteractiveEvent({
                                        type: this.currentInteractiveObject?.type ?? 'sign',
                                        interactive: this.currentInteractiveObject,
                                        scene: undefined
                                    });
                                }
                            }
                        }
                    }
                },
                movement: this.getMovementFromConfig(x! * this.tilemapScale, y! * this.tilemapScale, movement)
            });

            if(!possibleExistingCharacter)
            {
                characters.push(newCharacter);
            }

            for(let d of dialog.events)
            {
                this.gameEventManager.addEvent(eventName, d.eventKey, [newCharacter]);                     

                for(let character of characters)
                {
                    if(character.config.eventName == eventName && character.getEventKeyEnd() < eventKeyEnd)
                    {
                        this.gameEventManager.addEvent(eventName, d.eventKey, [character]);
                    }
                }
            }      
        }
    }

    private getMovementFromConfig(x: number, y: number, config: CharacterMovementConfig): ICharacterMovement
    {
        switch(config.type)
        {
            case "random":
                return new RandomInRadiusCharacterMovement(x, y, 16 * this.tilemapScale * config.radius);
            case "waypoint":
                return new WaypointCharacterMovement(x, y, this.tilemapScale, config);
            default:
                return new NopCharacterMovement();
        }
    }

    private configureTilemaps() {        
        this.map = this.make.tilemap({key: this.gameState.tilemap ?? 'map'});
        this.overworldTileset = this.map.addTilesetImage('overworld', 'overworldTiles', 16, 16, 1, 3)!;
        this.interiorTileset = this.map.addTilesetImage('interior', 'interiorTiles', 16, 16, 1, 3)!;
       // const interior = this.map.addTilesetImage('interior', 'interiorTiles', 16, 16, 1, 3)!;
        let backgroundLayer = this.map.createLayer('ground', [this.overworldTileset, this.interiorTileset], 0, 0);
        let groundDecorationLayer = this.map.createLayer('ground_decoration', [this.overworldTileset, this.interiorTileset], 0, 0);        

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

        this.interactText = this.add.text(0, 0, '!!', {fontFamily: 'Arial', fontSize: 64, color: '#ff0000'})
            .setStroke("#000000", 2)
            .setScrollFactor(0)
            .setVisible(false);

        this.interactText.setPosition(interactButton.x + (interactButton.displayWidth / 2) * 0.45, interactButton.y - (interactButton.displayHeight / 2) - this.interactText.displayHeight / 2);

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
        
        interactButton.on('pointerup', () => 
        {
            this.triggerInteractiveEvent({
                type: this.currentInteractiveObject?.type ?? 'sign',
                interactive: this.currentInteractiveObject,
                scene: this.currentInteractiveObject?.sceneTransition
            });
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

    private triggerInteractiveEvent(config: InteractiveTriggerConfig) 
    {
        if(!config)
        {
            return;
        }

        if(this.gameEventManager.getCurrentEventProgress('lyrics') == 0 && config.interactive?.eventName !== 'lyrics')
        {
            this.showDialog(['I should talk to my guest Joe Goldberging in my living room first'],
                {
                    endAction: EndAction.nop
                }
            );
            return;
        }

        if (config.interactive !== null) {
            switch (config.type) {
                case "sign":
                case "character":
                    if(config.interactive)
                    {
                        this.showDialog(config.interactive.messages, {
                            title: config.interactive.title,
                            endAction: config.interactive.endAction,
                            sourceCharacter: config.interactive.sourceCharacter,
                            grantedItem: config.interactive.grantedItem
                        });
                    }
                    break;

                case "scene":
                    if(config.scene)
                    {
                        this.triggerSceneFromConfig(config.scene);
                    }
                    break;

                case "grantItem":
                    if(config.interactive && config.interactive.grantedItem)
                    {
                        this.showDialog(config.interactive.messages, {
                            title: config.interactive.title,
                            endAction: config.interactive.endAction,
                            sourceCharacter: config.interactive.sourceCharacter,
                            grantedItem: config.interactive.grantedItem
                        });

                        this.grantItem(config.interactive.grantedItem, config.interactive.eventName)
                    }
                    break;
            }
        }
    }

    private triggerSceneFromConfig(config: SceneTransitionConfig) {
        if(config)
        {
            this.gameState.fromScene = this.scene.key;
            this.gameState.spawnX = config.fromX;
            this.gameState.spawnY = config.fromY;

            this.gameEventManager.purgeCharactersFromEvents();

            this.scene.start(config.toScene, {
                gameState: this.gameState
            });
        }
    }

    private configureLyricUI() {
        let papers = this.add.image(this.getGameWidth() * 0.08, this.getGameHeight() * 0.05, 'lyricPieces').setOrigin(0, 0).setScrollFactor(0);
        Align.scaleToGameWidth(papers, 0.08, this);

        let xText = this.add.text(0, 0, ' x ', { fontFamily: 'Arial', fontSize: 20, color: '#ffffff' }).setOrigin(0, 0).setStroke('#000000', 2).setScrollFactor(0);

        xText.setPosition(papers.x + papers.displayWidth + 7 * this.tilemapScale, papers.y + papers.displayHeight / 2 - xText.displayHeight / 2);

        this.lyricCountText = this.add.text(0, 0, this.gameState.lyricsPieces.toString(), { fontFamily: 'Arial', fontSize: 20, color: '#ffffff' }).setStroke('#000000', 2).setScrollFactor(0);
        this.lyricCountText.setPosition(xText.x + xText.displayWidth + 4 * this.tilemapScale, papers.y + papers.displayHeight / 2 - this.lyricCountText.displayHeight / 2);
    }

    private showDialog(messages: string[], config?: InteractiveConfig)
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
            title: config?.title === undefined ? undefined : this.rexUI.add.label({
                background: this.rexUI.add.roundRectangle(0, 0, 40, 40, 20, 0xC1BA71),
                text: this.add.text(0, 0, config?.title ?? 'Error', {fontSize: '24px'}),
                space: {
                    left: 10,
                    right: 10,
                    top: 10,
                    bottom: 10
                }
            }),

            content: this.rexUI.add.label({
                background: undefined,

                text: this.rexUI.wrapExpandText(this.add.text(0, 0, messages[messagesIndex])),
                expandTextWidth: true
            }),

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
                top: config?.title === undefined ? 20 : -20,
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

                        config?.sourceCharacter?.movement?.unpause();

                        let endAction = config?.endAction ?? this.currentInteractiveObject?.endAction ?? EndAction.nop;
                        let eventName = config?.eventName ?? this.currentInteractiveObject?.eventName ?? undefined;

                        if(endAction == EndAction.incrementEvent) 
                        {
                            this.incrementEvent(eventName);
                        }
                        else if(endAction == EndAction.startScene && this.currentInteractiveObject && this.currentInteractiveObject.sceneTransition)
                        {
                            this.triggerSceneFromConfig(this.currentInteractiveObject.sceneTransition);
                        }
                        else if(endAction == EndAction.giveLyricPiece)
                        {
                            this.addLyricPiece();
                            this.incrementEvent(eventName);
                        }
                        else if(endAction == EndAction.grantItem && config?.grantedItem)
                        {
                            this.grantItem(config.grantedItem, eventName);
                        }
                        else if(endAction == EndAction.clearItem)
                        {
                            this.currentItem?.destroy();
                            this.incrementEvent(eventName);
                        }
                        this.currentInteractiveObject = null;
                        return;
                    }

                    let text = this.dialog?.getElement('content') as Phaser.GameObjects.Text;
                    text.text = messages[messagesIndex];
                    
                    this.dialog?.layout();

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

    private grantItem(item: string, eventName: string | undefined) 
    {
        if (this.currentItem) 
        {
            this.currentItem.destroy();
        }

        this.currentItem = this.add.image(this.getGameWidth() * 0.08, this.getGameHeight() * 0.10, item).setOrigin(0, 0).setScrollFactor(0);
        Align.scaleToGameWidth(this.currentItem, 0.08, this);

        this.incrementEvent(eventName);
    }

    private addLyricPiece()
    {
        this.gameState.lyricsPieces++;
        this.lyricCountText.text = this.gameState.lyricsPieces.toString();
        this.incrementEvent('lyrics');
    }

    private configureEvent() 
    {
        let events = this.gameEventManager.getCurrentGameEvents();

        for(let i = 0; i < events.length; ++i)
        {
            events[i].activate();
        }
    }

    private incrementEvent(name: string | undefined) 
    {
        if(name)
        {
            this.gameEventManager.incrementEvent(name);      
            this.configureEvent();
        }
    }
}
