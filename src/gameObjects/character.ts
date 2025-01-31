import "phaser";
import { Align } from 'phaser-utility';
import { TILE_SCALE } from "../util/const";

export class CharacterConfig 
{
    //frames in Character spritesheet are 0-53 per row

    bodyFrame?: number = 0;

    shirtFrame?: number = 6;

    pantsFrame?: number = 57;

    shoesFrame?: number = 58;

    hairFrame?: number = 19;
}

export class Character
{
    x: number;
    y: number;

    bodySprite: Phaser.GameObjects.Sprite;
    shirtSprite: Phaser.GameObjects.Sprite;
    pantsSprite: Phaser.GameObjects.Sprite;
    shoesSprite: Phaser.GameObjects.Sprite;
    hairSprite: Phaser.GameObjects.Sprite;

    config: CharacterConfig;

    scene: Phaser.Scene;

    constructor(scene: Phaser.Scene, x: number, y: number, config?: CharacterConfig | undefined | null) 
    {
        this.scene = scene;
        this.x = x;
        this.y = y;

        if(config === null || config === undefined) {
            config = new CharacterConfig();
        }
        this.config = config;        
    }

    create(): Character {
        this.bodySprite = this.scene.add.sprite(this.x, this.y, 'characters', this.config.bodyFrame);
        this.shirtSprite = this.scene.add.sprite(this.x, this.y, 'characters', this.config.shirtFrame);
        this.pantsSprite = this.scene.add.sprite(this.x, this.y, 'characters', this.config.pantsFrame);
        this.shoesSprite = this.scene.add.sprite(this.x, this.y, 'characters', this.config.shoesFrame);
        this.hairSprite = this.scene.add.sprite(this.x, this.y, 'characters', this.config.hairFrame);

        this.applyScaling(this.bodySprite, TILE_SCALE, this.scene);
        this.applyScaling(this.shirtSprite, TILE_SCALE, this.scene);
        this.applyScaling(this.pantsSprite, TILE_SCALE, this.scene);
        this.applyScaling(this.shoesSprite, TILE_SCALE, this.scene);
        this.applyScaling(this.hairSprite, TILE_SCALE, this.scene);

        return this;
    }

    applyScaling(obj: Phaser.GameObjects.Sprite, scale: number, scene: Phaser.Scene) 
    {
        let width = parseInt(scene.game.config.width.toString());
        let newWidth = width * scale;

        obj.displayWidth = newWidth;
        obj.scaleY = obj.scaleX;
    }

    setPosition(x: number, y: number) 
    {
        this.bodySprite.setPosition(x, y);
        this.shirtSprite.setPosition(x, y);
        this.pantsSprite.setPosition(x, y);
        this.shoesSprite.setPosition(x, y);
        this.hairSprite.setPosition(x, y);
    }
}