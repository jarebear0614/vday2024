import { Field } from "../gameObjects/tetris/field";
import { Tetromino, TetrominoTransform } from "../gameObjects/tetris/tetromino";
import { TetrominoFactory } from "../gameObjects/tetris/tetrominoFactory";
import { BaseScene } from "./BaseScene";

import WebFont from 'webfontloader';

export enum GameplayState
{
    PlayerStart,

    DemoStart,

    InitializeTetromino,

    TetrominoFalling,

    LockDown,

    LinesClearing,

    GameOver,

    Paused
}

export class Tetris extends BaseScene
{
    private fieldWidth: number = 10;

    private fieldHeight: number = 20;

    private currentTetromino: Tetromino;

    private currentHoldTetromino: Tetromino | null;

    private nextQueue: Tetromino[];

    private usedHold: boolean;

    private factory: TetrominoFactory;

    private field: Field;

    private fallSpeed: number;

    private fallSpeedDelta: number;

    private fallSpeeds: number[];

    private levelGoals: number[];

    private level: number;

    private linesClearedDelta: number = 0;

    private score: number;

    private readonly lockdownTime: number = 150;

    private lockdownTimer: number = this.lockdownTime;

    private cursorPosition: Phaser.Math.Vector2;

    private readonly cursorStart: Phaser.Math.Vector2 = new Phaser.Math.Vector2(5, 1);

    private inputFromUpdate: boolean = false;

    private buttonClicks: boolean[] = new Array(4).fill(false);

    private currentGameplayState: GameplayState;

    public static minoScale: number = 1;
    
    private scaledMinoWidth: number = 32;

    private nextTopLeft: Phaser.Math.Vector2 = Phaser.Math.Vector2.ZERO;
    private holdTopLeft: Phaser.Math.Vector2 = Phaser.Math.Vector2.ZERO;
    private nextHoldBoxWidth: number = 32;
    private nextHoldBoxHeight: number = 32;

    private timeBetweenInput: number = 75;

    private currentTimeBetweenInput: number = this.timeBetweenInput;    

    public static readonly ghostTetrominoAlphaFactor = 0.25;

    private nextTetrominoTransform: TetrominoTransform;
    private holdTetrominoTransform: TetrominoTransform;


    private placeSound: Phaser.Sound.BaseSound;
    private lineClearSound: Phaser.Sound.BaseSound;
    private tetrisSound: Phaser.Sound.BaseSound;
    private levelUpSound: Phaser.Sound.BaseSound;
    private music: Phaser.Sound.BaseSound;

    //text flasher

    constructor()
    {
        super('Tetris');
    }

    init()
    {
        this.cameras.main.fadeOut(1);

        this.field = new Field(new Phaser.Math.Vector2(0, 0), this.fieldWidth, this.fieldHeight);
        this.factory = new TetrominoFactory(this);
        this.nextQueue = [];
        this.currentGameplayState = GameplayState.PlayerStart;
        this.level = 0;

        this.fallSpeed = 0;
        this.fallSpeedDelta = this.fallSpeed;

        this.levelGoals = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75];
        this.fallSpeeds = [1200, 1100, 1000, 900, 800, 700, 600, 500, 400, 300, 200, 100, 50, 25, 10];

        this.linesClearedDelta = this.levelGoals[this.level];
        this.fallSpeed = this.fallSpeeds[this.level];

        this.injectFont();

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
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
        this.load.spritesheet('minos', 'assets/tetris/minos.png', {frameWidth: 32, frameHeight: 32, spacing: 0, margin: 1});

        
        this.load.image('input_down', 'assets/tetris/down.png');
        this.load.image('input_left', 'assets/tetris/left.png');
        this.load.image('input_right', 'assets/tetris/right.png');
        this.load.image('input_clockwise', 'assets/tetris/clockwise.png');

        this.load.image('input_down_clicked', 'assets/tetris/down_clicked.png');
        this.load.image('input_left_clicked', 'assets/tetris/left_clicked.png');
        this.load.image('input_right_clicked', 'assets/tetris/right_clicked.png');
        this.load.image('input_clockwise_clicked', 'assets/tetris/clockwise_clicked.png');

        this.load.audio('levelup', 'assets/tetris/levelup.wav');
        this.load.audio('lineclear', 'assets/tetris/lineclear.wav');
        this.load.audio('tetris', 'assets/tetris/tetris.wav');
        this.load.audio('place', 'assets/tetris/place.wav');
        this.load.audio('music', 'assets/tetris/song.mp3');
    }

    create()
    {
        super.create();

        this.createFont();
        this.configureInput();
        this.setUpField();       
        
        this.lineClearSound = this.sound.add('lineclear', { loop: false });
        this.placeSound = this.sound.add('place', { loop: false });
        this.tetrisSound = this.sound.add('tetris', { loop: false });
        this.levelUpSound = this.sound.add('levelup', { loop: false });
        this.music = this.sound.add('music', {loop: true });

        this.music.play();
    }

    update(time: number, delta: number)
    {
        super.update(time, delta);

        switch(this.currentGameplayState)
        {
            case GameplayState.PlayerStart:
                this.currentGameplayState = GameplayState.InitializeTetromino;
                break;
            case GameplayState.InitializeTetromino:
                this.initializeNewTetromino();
                break;
            case GameplayState.TetrominoFalling:
                this.handleInput(delta);
                this.handleTetrominoFallingState(delta);                

                if(this.currentTetromino)
                {
                    let dropPosition = this.getDropTetrominoPosition();

                    this.currentTetromino.setPosition(
                        this.field.fieldTopleft.x + this.cursorPosition.x * 32 * Tetris.minoScale, 
                        this.field.fieldTopleft.y + this.cursorPosition.y * 32 * Tetris.minoScale,
                        this.field.fieldTopleft.x + dropPosition.x * 32 * Tetris.minoScale, 
                        this.field.fieldTopleft.y + dropPosition.y * 32 * Tetris.minoScale);
                }
                break;
            case GameplayState.LockDown:
                this.handleInput(delta);
                this.handleLockDownState(delta);
                break;
            case GameplayState.LinesClearing:
                this.handleLinesClearingState(delta);
                break;
            case GameplayState.GameOver:
                this.handleGameOverScreen();
                break;
            case GameplayState.Paused:
                break;
        }
    }

    public resetInput()
    {
        this.buttonClicks = new Array(4).fill(false);
    }    

    private injectFont() {
        const element = document.createElement('style');
        document.head.appendChild(element);
        const sheet = element.sheet;

        if (sheet) {
            let styles = '@font-face { font-family: "quartz"; src: url("assets/tetris/QuartzMSRegular.TTF") format("TrueType"); }\n';
            sheet.insertRule(styles, 0);
        }
    }

    private createFont()
    {
        WebFont.load({
            custom: {
                families: [ 'quartz' ]
            },
            active: () =>
            {
                this.add.text(32, 32, 'Start', { fontFamily: 'quartz', fontSize: 80, color: '#ff0000' }).setShadow(2, 2, '#333333', 2, false, true);
            }
        });
    }

    private setUpField()
    {
        let gameWidth = this.getGameWidth();
        let newWidth = gameWidth * .065;
        let scale = newWidth / 32;

        Tetris.minoScale = scale;

        this.cameras.main.setBackgroundColor(0x666666);   

        this.scaledMinoWidth = 32 * scale;
        let rectangleWidth = this.scaledMinoWidth * this.field.blockWidth;
        let rectangleHeight = this.scaledMinoWidth * this.field.blockHeight;

        let fieldTopLeftX = this.getGameWidth() * .05;
        let fieldTopLeftY = this.getGameHeight() / 2 - rectangleHeight / 2;

        this.add.rectangle(fieldTopLeftX, fieldTopLeftY, rectangleWidth, rectangleHeight, 0x333333).setOrigin(0, 0);

        this.nextTopLeft = new Phaser.Math.Vector2(fieldTopLeftX + rectangleWidth + (10 * scale), fieldTopLeftY);
        this.holdTopLeft = new Phaser.Math.Vector2(fieldTopLeftX + rectangleWidth + (10 * scale), fieldTopLeftY + this.scaledMinoWidth * 5 + (10 * scale));
        this.nextHoldBoxWidth = this.scaledMinoWidth * 4;
        this.nextHoldBoxHeight = this.scaledMinoWidth * 5;

        this.add.rectangle(this.nextTopLeft.x, this.nextTopLeft.y, this.nextHoldBoxWidth, this.nextHoldBoxHeight, 0x333333).setOrigin(0, 0);
        this.add.rectangle(this.holdTopLeft.x, this.holdTopLeft.y, this.nextHoldBoxWidth, this.nextHoldBoxHeight, 0x333333)
            .setOrigin(0, 0)
            .setInteractive()
            .addListener('pointerup', () => {
                this.holdTetromino();
            });

        this.field.fieldTopleft = new Phaser.Math.Vector2(fieldTopLeftX, fieldTopLeftY);
        
        this.nextQueue.push(this.factory.generateRandomTetromino());

        if(this.nextQueue[0].getTetrominoType() == 3)
        {
            this.nextQueue[0].rotateClockwise();
        }

        this.nextTetrominoTransform = this.boxTetrominoTransform(this.nextQueue[0], this.nextTopLeft);
    }

    private boxTetrominoTransform(tetromino: Tetromino, topLeft: Phaser.Math.Vector2) : TetrominoTransform
    {
        let additionalScale = 0.8;

        let minX = 0;
        let minY = 0;
        let maxX = 0;
        let maxY = 0;

        for(let i = 0; i < 4; ++i)
        {
            let mino = tetromino.get(i);

            if(mino.x > maxX)
            {
                maxX = mino.x;
            }
            if(mino.y > maxY)
            {
                maxY = mino.y;
            }

            if(mino.x < minX)
            {
                minX = mino.x;
            }
            if(mino.y < minY)
            {
                minY = mino.y;
            }
        }

        let rangeX = maxX - minX + 1;
        let rangeY = maxY - minY + 1;
        
        let nextTetrominoWidth = (rangeX * this.scaledMinoWidth * additionalScale);
        let nextTetrominoHeight = (rangeY * this.scaledMinoWidth * additionalScale);

        let originX = topLeft.x - minX * this.scaledMinoWidth * additionalScale;
        let originY = topLeft.y - minY * this.scaledMinoWidth * additionalScale;

        return new TetrominoTransform(this, tetromino, originX + this.nextHoldBoxWidth / 2 - nextTetrominoWidth / 2, originY + this.nextHoldBoxHeight / 2 - nextTetrominoHeight / 2, false, true, 0.8);
    }

    private handleInput(delta: number)
    {
        this.inputFromUpdate = false;

        this.currentTimeBetweenInput -= delta;

        if(this.currentTimeBetweenInput <= 0)
        {
            this.currentTimeBetweenInput = this.timeBetweenInput;
            if(this.buttonClicks[0])
            {
                this.inputFromUpdate = true;
                this.moveTetromino(0, 1);
            }
            else if(this.buttonClicks[1])
            {
                this.inputFromUpdate = true;
                this.moveTetromino(-1, 0);
            }
            else if(this.buttonClicks[2])
            {
                this.inputFromUpdate = true;
                this.moveTetromino(1, 0);
            }
            else if(this.buttonClicks[3])
            {
                this.inputFromUpdate = true;
                this.rotateTetrominoClockwise();
                this.buttonClicks[3] = false;

            }
        }
    }

    private configureInput()
    {
        let inputWidth = 80;
        let gameWidth = this.getGameWidth();
        let newWidth = gameWidth * 0.25;
        let inputScale = newWidth / inputWidth;

        let downClickedImage: Phaser.GameObjects.Image;
        let leftClickedImage: Phaser.GameObjects.Image;
        let rightClickedImage: Phaser.GameObjects.Image;
        

        let topLeft = new Phaser.Math.Vector2(0, this.getGameHeight() - (inputWidth * inputScale));
        this.add.image(topLeft.x + (inputWidth * inputScale * 0), topLeft.y, 'input_down')
                .setOrigin(0, 0).setScale(inputScale, inputScale)
                .setInteractive()
                .addListener('pointerdown', () =>
                {
                    this.buttonClicks[0] = true;
                    downClickedImage.setVisible(true);
                })
                .addListener('pointerup', () => { this.buttonClicks[0] = false; downClickedImage.setVisible(false); });

        this.add.image(topLeft.x + (inputWidth * inputScale * 1), topLeft.y, 'input_left')
                .setOrigin(0, 0)
                .setScale(inputScale, inputScale)
                .setInteractive()
                .addListener('pointerdown', () =>
                {
                    this.buttonClicks[1] = true;
                    leftClickedImage.setVisible(true);
                })
                .addListener('pointerup', () => { this.buttonClicks[1] = false; leftClickedImage.setVisible(false); });
            
        this.add.image(topLeft.x + (inputWidth * inputScale * 2), topLeft.y, 'input_right')
                .setOrigin(0, 0)
                .setScale(inputScale, inputScale)
                .setInteractive()
                .addListener('pointerdown', () =>
                {
                    this.buttonClicks[2] = true;
                    rightClickedImage.setVisible(true);
                })
                .addListener('pointerup', () => { this.buttonClicks[2] = false; rightClickedImage.setVisible(false); });

        this.add.image(topLeft.x + (inputWidth * inputScale * 3), topLeft.y, 'input_clockwise')
                .setOrigin(0, 0)
                .setScale(inputScale, inputScale)
                .setInteractive()
                .addListener('pointerup', () =>
                {
                    this.buttonClicks[3] = true;
                });
        
        downClickedImage = this.add.image(topLeft.x + (inputWidth * inputScale * 0), topLeft.y, 'input_down_clicked')
                                    .setOrigin(0, 0)
                                    .setScale(inputScale, inputScale)
                                    .setVisible(false);

        leftClickedImage = this.add.image(topLeft.x + (inputWidth * inputScale * 1), topLeft.y, 'input_left_clicked')
                                    .setOrigin(0, 0)
                                    .setScale(inputScale, inputScale)
                                    .setVisible(false);

        rightClickedImage = this.add.image(topLeft.x + (inputWidth * inputScale * 2), topLeft.y, 'input_right_clicked')
                                    .setOrigin(0, 0)
                                    .setScale(inputScale, inputScale)
                                    .setVisible(false);
    }

    public initializeNewTetromino()
    {
        if(this.currentTetromino)
        {
            this.currentTetromino.destroyGhost();
        }

        this.currentTetromino = this.nextQueue.shift()!;
        this.currentTetromino.transform.setVisible(true);
        this.nextQueue.push(this.factory.generateRandomTetromino());

        if(this.nextTetrominoTransform)
        {
            this.nextTetrominoTransform.destroy();
        }

        this.nextTetrominoTransform = this.boxTetrominoTransform(this.nextQueue[0], this.nextTopLeft);

        this.cursorPosition = new Phaser.Math.Vector2(this.cursorStart.x, this.cursorStart.y);

        let dropPosition = this.getDropTetrominoPosition();
        this.currentTetromino.createGhostTransform(this, this.field.fieldTopleft.x + dropPosition.x * 32 * Tetris.minoScale, this.field.fieldTopleft.y + dropPosition.y * 32 * Tetris.minoScale);

        this.fallSpeedDelta - this.fallSpeed;
        this.currentGameplayState = GameplayState.TetrominoFalling;

        if(!this.field.isTetrominoInsertableAt(this.currentTetromino, this.cursorPosition) || this.field.isGameOver())
        {
            this.currentGameplayState = GameplayState.GameOver;
        }
    }

    public handleTetrominoFallingState(delta: number)
    {
        this.fallSpeedDelta -= delta;

        if(this.fallSpeedDelta <= 0)
        {
            this.fallSpeedDelta = this.fallSpeed;

            let newCursorPosition = new Phaser.Math.Vector2(this.cursorPosition.x, this.cursorPosition.y);
            newCursorPosition.y += 1;

            if(this.field.isTetrominoInsertableAt(this.currentTetromino, newCursorPosition))
            {
                this.cursorPosition = newCursorPosition;
            }
            else
            {
                this.currentGameplayState = GameplayState.LockDown;
            }
        }
    }

    public handleLockDownState(delta: number)
    {
        this.lockdownTimer -= delta;
        if(this.lockdownTimer <= 0)
        {
            this.score += (3 +  ((this.level + 1) * 3));
            this.lockdownTimer = this.lockdownTime;
            this.field.insertTetrominoAt(this.currentTetromino, this.cursorPosition);
            this.currentGameplayState = GameplayState.LinesClearing;

            this.placeSound.play();
        }

        let down = new Phaser.Math.Vector2(this.cursorPosition.x, this.cursorPosition.y + 1);
        if(this.inputFromUpdate || this.field.isTetrominoInsertableAt(this.currentTetromino, down))
        {
            this.lockdownTimer = this.lockdownTime;
            this.fallSpeedDelta = this.fallSpeed;
            this.currentGameplayState = GameplayState.TetrominoFalling;
        }
    }

    public handleLinesClearingState(delta: number)
    {
        let linesClearedCount: number = this.field.clearLines();
        
        if(linesClearedCount > 0)
        {
            if(linesClearedCount == 4)
            {
                this.linesClearedDelta -= 8;
                this.tetrisSound.play();
            }
            else
            {
                this.linesClearedDelta -= linesClearedCount;
                this.lineClearSound.play();
            }
        }

        if(this.linesClearedDelta <= 0)
        {
            this.levelUp();
        }

        this.score += linesClearedCount * (this.level + 1) * 100;
        this.usedHold = false;
        this.currentGameplayState = GameplayState.InitializeTetromino;
    }

    public handleGameOverScreen()
    {
        //TODO: Handle game over
    }

    public setupGame()
    {
        this.score = this.level = 0;
        this.linesClearedDelta = this.levelGoals[this.level];
        this.fallSpeed = this.fallSpeeds[this.level];

        this.factory.flush();
        this.field.resetField();

        this.nextQueue = [];
        this.nextQueue.push(this.factory.generateRandomTetromino());

        this.currentHoldTetromino = null;
        this.usedHold = false;
    }

    public levelUp()
    {
        if(this.level < 14)
        {
            this.fallSpeed = this.fallSpeeds[this.level];
            this.linesClearedDelta = this.levelGoals[++this.level];
            this.levelUpSound.play();
        }
    }

    private moveTetromino(x: number, y: number)
    {
        let newCursorPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(this.cursorPosition.x, this.cursorPosition.y);
        newCursorPosition.x += x;
        newCursorPosition.y += y;

        if(this.field.isTetrominoInsertableAt(this.currentTetromino, newCursorPosition))
        {
            this.cursorPosition = newCursorPosition;
        }
    }

    private dropTetromino()
    {
        let position = this.getDropTetrominoPosition();
        this.field.insertTetrominoAt(this.currentTetromino, position);
        this.score += position.y - this.cursorPosition.y;
        this.currentGameplayState = GameplayState.LinesClearing;

        //TODO: Lockdown sound
    }

    private getDropTetrominoPosition() : Phaser.Math.Vector2
    {
        let y: number = new Phaser.Math.Vector2(this.cursorPosition.x, this.cursorPosition.y).y;

        while(this.field.isTetrominoInsertableAt(this.currentTetromino, new Phaser.Math.Vector2(this.cursorPosition.x, y + 1))) { ++y; }

        return new Phaser.Math.Vector2(this.cursorPosition.x, y);
    }

    private rotateTetrominoClockwise()
    {
        this.currentTetromino.rotateClockwise();

        if(!this.field.isTetrominoInsertableAt(this.currentTetromino, this.cursorPosition))
        {
            let result = this.iterateWallKicks();
            if(result[0])
            {
                this.cursorPosition = result[1];
            }
            else
            {
                this.currentTetromino.rotateCounterClockwise();
            }
        }
    }

    private rotateTetrominoCounterClockwise()
    {
        this.currentTetromino.rotateCounterClockwise();

        if(!this.field.isTetrominoInsertableAt(this.currentTetromino, this.cursorPosition))
        {
            let result = this.iterateWallKicks();
            if(result[0])
            {
                this.cursorPosition = result[1];
            }
            else
            {
                this.currentTetromino.rotateClockwise();
            }
        }
    }

    private iterateWallKicks(): [boolean, Phaser.Math.Vector2]
    {
        let wallData = this.currentTetromino.getWallKickData()[this.currentTetromino.getRotationState()];

        let success: boolean = false;
        let position = new Phaser.Math.Vector2(0, 0);

        for(let i = 0; i < wallData.length && !success; ++i) 
        {
            let currentWallKick: Phaser.Math.Vector2 = wallData[i];
            position = new Phaser.Math.Vector2(this.cursorPosition.x, this.cursorPosition.y);

            position = new Phaser.Math.Vector2(this.cursorPosition.x + currentWallKick.x, this.cursorPosition.y + currentWallKick.y);

            success = this.field.isTetrominoInsertableAt(this.currentTetromino, position);
        }

        return [success, position];
    }

    private holdTetromino()
    {
        if(!this.usedHold)
        {
            this.currentTetromino.destroyGhost();

            let temp: Tetromino | null = this.currentHoldTetromino;
            this.currentHoldTetromino = this.currentTetromino;
            this.currentHoldTetromino.resetRotation();

            if(temp != null)
            {
                this.currentTetromino = temp;
                this.currentTetromino.transform.setVisible(true);
                this.cursorPosition = new Phaser.Math.Vector2(this.cursorStart.x, this.cursorStart.y);
            }
            else
            {
                this.currentGameplayState = GameplayState.InitializeTetromino;
            }

            this.currentHoldTetromino.transform.setVisible(false);

            if(this.holdTetrominoTransform)
            {
                this.holdTetrominoTransform.destroy();
                
            }

            this.holdTetrominoTransform = this.boxTetrominoTransform(this.currentHoldTetromino, this.holdTopLeft);

            let dropPosition = this.getDropTetrominoPosition();
            this.currentTetromino.createGhostTransform(this, this.field.fieldTopleft.x + dropPosition.x * 32 * Tetris.minoScale, this.field.fieldTopleft.y + dropPosition.y * 32 * Tetris.minoScale);

            this.usedHold = true;
        }
    }
}