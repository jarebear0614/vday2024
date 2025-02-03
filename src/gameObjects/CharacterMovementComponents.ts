import { Character } from "./character";
import { ICharacterMovement } from "./ICharacterMovement";

export class NopCharacterMovement implements ICharacterMovement
{
    setCharacter(character: Character): void 
    {
        
    }

    update(delta: number): void 
    {
        
    }    
}


export class RandomInRadiusCharacterMovement implements ICharacterMovement
{
    private character: Character;

    private xCenter: number = 0;
    private yCenter: number = 0;
    private radius: number = 0;

    private startX: number = 0;
    private startY: number = 0;

    private currentWaitTime = 0;
    private waitUntil = 0;
    private waitTimeRange = {min: 500, max: 1500};

    private isMoving: boolean = false;
    private destination: Phaser.Math.Vector2 = Phaser.Math.Vector2.ZERO;
    private moveTime: number = 0;

    private velocity: number = 256;

    constructor(xCenter: number, yCenter: number, radius: number)
    {
        this.xCenter = xCenter;
        this.yCenter = yCenter;
        this.radius = radius;

        this.waitUntil = Math.round(Math.random() * this.waitTimeRange.max - this.waitTimeRange.min) + this.waitTimeRange.min;
    }

    setCharacter(character: Character): void {
        this.character = character;
    }

    update(delta: number): void 
    {
        if(!this.character)
        {
            return;
        }

        if(this.isMoving)
        {
            let start = new Phaser.Math.Vector2(this.startX, this.startY);       
            
            let velScale = this.velocity / start.distance(this.destination);

            this.moveTime += (delta / 1000);

            let newPosition = Phaser.Math.LinearXY(start, this.destination, this.moveTime * velScale);
            this.character.setPosition(newPosition.x, newPosition.y);

            if(this.moveTime * velScale >= 1)
            {
                this.isMoving = false;
                this.waitUntil = Math.round(Math.random() * this.waitTimeRange.max - this.waitTimeRange.min) + this.waitTimeRange.min;
            }
        }
        else 
        {
            this.currentWaitTime += delta;
            if(this.currentWaitTime >= this.waitUntil)
            {
                this.currentWaitTime = 0;
                this.moveTime = 0;
                this.isMoving = true;                
                
                this.destination.x = Math.round(Math.random() * this.radius) + this.xCenter - this.radius;
                this.destination.y = Math.round(Math.random() * this.radius) + this.yCenter - this.radius;

                let transform = <unknown>this.character.spriteGroup.children.getArray()[0] as Phaser.GameObjects.Components.Transform;
                this.startX = transform.x;
                this.startY = transform.y;
            }
        }
    }
}

export class CharacterMovementConfig 
{
    type: string = '';

    loop: boolean;
    waypoints: Phaser.Math.Vector2[];
}

export class WaypointCharacterMovement implements ICharacterMovement
{
    private character: Character;

    private loop: boolean = false;
    private waypoints: Phaser.Math.Vector2[] = [];

    private scale: number = 1.0;

    private waypointIndex = 0;

    private start: Phaser.Math.Vector2 = Phaser.Math.Vector2.ZERO;
    private destination: Phaser.Math.Vector2 = Phaser.Math.Vector2.ZERO;

    private currentWaitTime = 0;
    private waitUntil = 0;
    private waitTimeRange = {min: 500, max: 1500};

    private isMoving: boolean = false;
    private moveTime: number = 0;

    private velocity: number = 256;

    constructor(scale: number, config: CharacterMovementConfig)
    {
        this.waypoints = config.waypoints;
        this.loop = config.loop;
        this.scale = scale;

        this.destination = this.waypoints[0];
    }

    setCharacter(character: Character): void 
    {
        this.character = character;
    }

    update(delta: number): void 
    {
        if(!this.character)
        {
            return;
        }
    
        let transform = <unknown>this.character.spriteGroup.children.getArray()[0] as Phaser.GameObjects.Components.Transform;
        if(this.isMoving)
        {
            let velScale = this.velocity / this.start.distance(this.destination);

            this.moveTime += (delta / 1000.0);

            let newPosition = Phaser.Math.LinearXY(this.start, this.destination, this.moveTime * velScale)

            this.character.setPosition(newPosition.x, newPosition.y);

            if(this.moveTime * velScale >= 1)
            {
                this.isMoving = false;
                this.waitUntil = Math.round(Math.random() * this.waitTimeRange.max - this.waitTimeRange.min) + this.waitTimeRange.min;
                this.waypointIndex = (this.waypointIndex + 1) % this.waypoints.length;
            }
        }
        else {
            this.currentWaitTime += delta;
            if(this.currentWaitTime >= this.waitUntil)
            {
                this.currentWaitTime = 0;
                this.isMoving = true;
                this.moveTime = 0;

                this.start = new Phaser.Math.Vector2(transform.x, transform.y);
                this.destination = new Phaser.Math.Vector2(
                    this.waypoints[this.waypointIndex].x * (16 * this.scale), 
                    this.waypoints[this.waypointIndex].y * (16 * this.scale));

                console.log(this.waypoints[this.waypointIndex]);
                console.log(this.destination);
            }
        }
    }    
}