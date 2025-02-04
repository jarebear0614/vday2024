import { Field } from "../gameObjects/tetris/field";
import { Tetromino, TetrominoTransform } from "../gameObjects/tetris/tetromino";
import { TetrominoFactory } from "../gameObjects/tetris/tetrominoFactory";
import { BaseScene } from "./BaseScene";

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

    private readonly lockdownTime: number = 500;

    private lockdownTimer: number = this.lockdownTime;

    private cursorPosition: Phaser.Math.Vector2;

    private readonly cursorStart: Phaser.Math.Vector2 = new Phaser.Math.Vector2(5, 1);

    private inputFromUpdate: boolean = false;

    private buttonClicks: boolean[] = new Array(4).fill(false);

    private currentGameplayState: GameplayState;

    public static minoScale: number = 1;

    //text flasher

    constructor()
    {
        super('Tetris');
    }

    init()
    {
        this.field = new Field(new Phaser.Math.Vector2(0, 0), this.fieldWidth, this.fieldHeight);
        this.factory = new TetrominoFactory(this);
        this.nextQueue = [];
        this.currentGameplayState = GameplayState.PlayerStart;
        this.level = 0;

        this.fallSpeed = 0;
        this.fallSpeedDelta = this.fallSpeed;

        this.levelGoals = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75];
        this.fallSpeeds = [10, 1100, 1000, 900, 800, 700, 600, 500, 400, 300, 200, 100, 50, 25, 10];

        this.linesClearedDelta = this.levelGoals[this.level];
        this.fallSpeed = this.fallSpeeds[this.level];
    }

    preload()
    {
        this.load.spritesheet('minos', 'assets/tetris/minos.png', {frameWidth: 32, frameHeight: 32, spacing: 0, margin: 1});
        
    }

    create()
    {
        super.create();

        let gameWidth = this.getGameWidth();
        let newWidth = gameWidth * .068;
        let scale = newWidth / 32;

        Tetris.minoScale = scale;

        this.cameras.main.setBackgroundColor(0x666666);   

        let minoWidth = 32 * scale;
        let rectangleWidth = minoWidth * this.field.blockWidth;
        let rectangleHeight = minoWidth * this.field.blockHeight;

        let fieldTopLeftX = this.getGameWidth() * .05;
        let fieldTopLeftY = this.getGameHeight() / 2 - rectangleHeight / 2;

        this.add.rectangle(fieldTopLeftX, fieldTopLeftY, rectangleWidth, rectangleHeight, 0x333333).setOrigin(0, 0);

        this.field.fieldTopleft = new Phaser.Math.Vector2(fieldTopLeftX, fieldTopLeftY);
        
        this.nextQueue.push(this.factory.generateRandomTetromino());
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
                //TODO: Input
                this.handleTetrominoFallingState(delta);
                break;
            case GameplayState.LockDown:
                //TODO: Input
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

        if(this.currentTetromino)
        {
            this.currentTetromino.transform.setPosition(this.field.fieldTopleft.x + this.cursorPosition.x * 32 * Tetris.minoScale, this.field.fieldTopleft.y + this.cursorPosition.y * 32 * Tetris.minoScale);
        }
    }

    public resetInput()
    {
        this.buttonClicks = new Array(4).fill(false);
    }

    public initializeNewTetromino()
    {
        this.currentTetromino = this.nextQueue.shift()!;
        this.nextQueue.push(this.factory.generateRandomTetromino());
        this.cursorPosition = new Phaser.Math.Vector2(this.cursorStart.x, this.cursorStart.y);
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

            //TODO: Lockdown audio
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
                //TODO: Tetris Sound
            }
            else
            {
                this.linesClearedDelta -= linesClearedCount;
                //TODO: Line clear sound
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
            //TODO: Audio level up
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
            let temp: Tetromino | null = this.currentHoldTetromino;
            this.currentHoldTetromino = this.currentTetromino;
            this.currentHoldTetromino.resetRotation();

            if(temp != null)
            {
                this.currentTetromino = temp;
                this.cursorPosition = new Phaser.Math.Vector2(this.cursorStart.x, this.cursorStart.y);
            }
            else
            {
                this.currentGameplayState = GameplayState.InitializeTetromino;
            }

            this.usedHold = true;
        }
    }
}