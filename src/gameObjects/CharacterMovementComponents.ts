import { Character } from "./character";
import { ICharacterMovement } from "./ICharacterMovement";

export class NopCharacterMovement implements ICharacterMovement
{
    pause(): void 
    {
        
    }

    unpause(): void 
    {
        
    }

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

    private start: Phaser.Math.Vector2 = Phaser.Math.Vector2.ZERO;

    private currentWaitTime = 0;
    private waitUntil = 0;
    private waitTimeRange = {min: 500, max: 1500};

    private isMoving: boolean = false;
    private destination: Phaser.Math.Vector2 = Phaser.Math.Vector2.ZERO;

    private velocity: number = 128;

    private isPaused: boolean = false;

    private lastDistance: number = 0;

    constructor(xCenter: number, yCenter: number, radius: number)
    {
        this.xCenter = xCenter;
        this.yCenter = yCenter;
        this.radius = radius;

        this.waitUntil = Math.round(Math.random() * this.waitTimeRange.max - this.waitTimeRange.min) + this.waitTimeRange.min;

        this.start = new Phaser.Math.Vector2(this.xCenter, this.yCenter);

        this.destination = new Phaser.Math.Vector2(this.xCenter, this.yCenter);
    }
    
    pause(): void 
    {
        this.isPaused = true;
        this.character.setVelocity(0, 0);
    }

    unpause(): void 
    {
        this.isPaused = false;

        let v = new Phaser.Math.Vector2(this.destination.x, this.destination.y).subtract(this.start).normalize().scale(this.velocity);
        this.character.setVelocity(v.x, v.y);
    }

    setCharacter(character: Character): void {
        this.character = character;
    }

    update(delta: number): void 
    {
        if(!this.character || !this.character.spriteGroup.children || this.isPaused)
        {
            return;
        }

        if(this.isMoving)
        {
            let currentDistance = this.destination.distance(this.character.getPosition());
            if(currentDistance > this.lastDistance)
            {
                let v = new Phaser.Math.Vector2(this.destination.x, this.destination.y).subtract(this.character.getPosition()).normalize().scale(this.velocity);
                this.character.setVelocity(v.x, v.y);
            }

            if(this.destination.distance(this.character.getPosition()) <= 5)
            {
                this.isMoving = false;
                this.waitUntil = Math.round(Math.random() * this.waitTimeRange.max - this.waitTimeRange.min) + this.waitTimeRange.min;
                this.character.setVelocity(0, 0);
            }
        }
        else 
        {
            this.currentWaitTime += delta;
            if(this.currentWaitTime >= this.waitUntil)
            {
                this.currentWaitTime = 0;
                this.isMoving = true;     
           
                this.start = new Phaser.Math.Vector2(this.destination.x, this.destination.y);
                
                this.destination.x = Math.round(Math.random() * this.radius) + this.xCenter - this.radius;
                this.destination.y = Math.round(Math.random() * this.radius) + this.yCenter - this.radius;

                let v = new Phaser.Math.Vector2(this.destination.x, this.destination.y).subtract(this.start).normalize().scale(this.velocity);
                this.character.setVelocity(v.x, v.y);

                this.lastDistance = this.destination.distance(this.character.getPosition());
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

    private velocity: number = 128;

    private isPaused: boolean = false;

    private lastDistance: number = 0;

    constructor(xCenter: number, yCenter: number, scale: number, config: CharacterMovementConfig)
    {
        this.waypoints = config.waypoints;
        this.loop = config.loop;
        this.scale = scale;

        this.destination = this.waypoints[0];

        this.start = new Phaser.Math.Vector2(xCenter, yCenter);
        this.destination = new Phaser.Math.Vector2(xCenter, yCenter);
    }
    
    pause(): void 
    {
        this.isPaused = true;
        this.character.setVelocity(0, 0);
    }

    unpause(): void 
    {
        this.isPaused = false;
        let v = new Phaser.Math.Vector2(this.destination.x, this.destination.y).subtract(this.start).normalize().scale(this.velocity);
        this.character.setVelocity(v.x, v.y);
    }

    setCharacter(character: Character): void 
    {
        this.character = character;
    }

    update(delta: number): void 
    {
        if(!this.character || !this.character.spriteGroup.children || this.isPaused)
        {
            return;
        }
        
        if(this.isMoving)
        {
            let currentDistance = this.destination.distance(this.character.getPosition());
            if(currentDistance > this.lastDistance)
            {
                let v = new Phaser.Math.Vector2(this.destination.x, this.destination.y).subtract(this.character.getPosition()).normalize().scale(this.velocity);
                this.character.setVelocity(v.x, v.y);
            }

            if(currentDistance <= 5)
            {
                this.isMoving = false;
                this.waitUntil = Math.round(Math.random() * this.waitTimeRange.max - this.waitTimeRange.min) + this.waitTimeRange.min;
                this.waypointIndex = (this.waypointIndex + 1) % this.waypoints.length;
                this.character.setVelocity(0, 0);

                if(this.waypointIndex == 0 && !this.loop)
                {
                    this.waitUntil = Number.MAX_SAFE_INTEGER;
                }
            }
        } else {
            this.currentWaitTime += delta;
            if(this.currentWaitTime >= this.waitUntil)
            {
                this.currentWaitTime = 0;
                this.isMoving = true;

                this.start = new Phaser.Math.Vector2(this.destination.x, this.destination.y);
                this.destination = new Phaser.Math.Vector2(
                    this.waypoints[this.waypointIndex].x * (16 * this.scale), 
                    this.waypoints[this.waypointIndex].y * (16 * this.scale));

                let v = new Phaser.Math.Vector2(this.destination.x, this.destination.y).subtract(this.start).normalize().scale(this.velocity);
                this.character.setVelocity(v.x, v.y);

                this.lastDistance = this.destination.distance(this.character.getPosition());
            }
        }
    }    
}