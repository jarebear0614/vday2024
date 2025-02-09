import { BaseScene } from "../scenes/BaseScene";
import { Align } from "../util/align";
import { TILE_SCALE } from "../util/const";
import { Character } from "./character";

export class Player extends Character 
{
    body: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    constructor(scene: BaseScene, x: number, y: number, name: string) 
    {
        super(scene, x, y, name, {
            bodyFrame: 1,
            pantsFrame: 3,
            shoesFrame: 4,
            hairFrame: 240,
            shirtFrame: 392
        });
    }

    create(): Character {
        let character = super.create();

        this.body = this.scene.physics.add.sprite(100, 100, "transparent", 0);
        this.body.setSize(16, 16);
        this.body.setPushable(false);
        
        Align.scaleToGameWidth(this.body, TILE_SCALE, this.scene); 

        return character;
    }

    getBody() : Phaser.Types.Physics.Arcade.SpriteWithDynamicBody 
    {
        return this.body;
    }

    setVelocityX(x: number) 
    {
        if(this.destroyed)
        {
            return;
        }
        
        this.body.setVelocityX(x);
    }

    setVelocityY(y: number) 
    {
        this.body.setVelocityY(y);
    }

    setVelocity(x: number, y: number) 
    {
        if(this.destroyed || !this.body)
        {
            return;
        }

        this.body.setVelocity(x, y);
    }

    setPositionX(x: number) 
    {
        super.setPositionX(x);
        this.body.setX(x);
    }

    setPositionY(y: number) 
    {
        super.setPositionY(y);
        this.body.setY(y);
    }

    setPosition(x: number, y: number) 
    {
        super.setPosition(x, y);
        this.body.setPosition(x, y);
    }

    getX() : number 
    {
        return this.body.x;
    }

    getY() : number 
    {
        return this.body.y;
    }

    update(delta: number) 
    {
        super.setPosition(this.body.x, this.body.y);
    }
}