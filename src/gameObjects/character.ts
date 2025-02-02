import "phaser";
import { TILE_SCALE } from "../util/const";
import { BaseScene } from "../scenes/BaseScene";
import { CharacterEvent } from "./dialog";
import { Align } from "../util/align";

export class CharacterConfig 
{
    //frames in Character spritesheet are 0-53 per row

    bodyFrame?: number = 0;

    shirtFrame?: number = 6;

    pantsFrame?: number = 57;

    shoesFrame?: number = 58;

    hairFrame?: number = 19;

    dialog?: CharacterEvent;
}

export class Character
{
    public spriteGroup: Phaser.Physics.Arcade.StaticGroup;

    private x: number;
    private y: number;

    overlapDialogSprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    private config: CharacterConfig;

    protected scene: BaseScene;

    constructor(scene: BaseScene, x: number, y: number, name: string, config?: CharacterConfig | undefined | null) 
    {
        this.scene = scene;
        this.x = x;
        this.y = y;

        if(config === null || config === undefined) {
            config = new CharacterConfig();
        }
        this.config = config;        
    }

    create(): Character 
    {       
        let width = parseInt(this.scene.game.config.width.toString());
        let newWidth = width * TILE_SCALE;
        let scale = newWidth / 16;

        this.spriteGroup = this.scene.physics.add.staticGroup();
        
        this.spriteGroup.create(0, 0, 'characters', this.config.bodyFrame, true, true).setScale(scale, scale).refreshBody();
        this.spriteGroup.create(0, 0, 'characters', this.config.shirtFrame, true, true).setScale(scale, scale).refreshBody();
        this.spriteGroup.create(0, 0, 'characters', this.config.pantsFrame, true, true).setScale(scale, scale).refreshBody();
        this.spriteGroup.create(0, 0, 'characters', this.config.shoesFrame, true, true).setScale(scale, scale).refreshBody();
        this.spriteGroup.create(0, 0, 'characters', this.config.hairFrame, true, true).setScale(scale, scale).refreshBody();
        
        this.spriteGroup.setXY(this.x, this.y); 
        this.spriteGroup.refresh();

        this.overlapDialogSprite = this.scene.physics.add.sprite(this.x, this.y, "transparent", 0);
        this.overlapDialogSprite.setSize(24, 24);
        
        Align.scaleToGameWidth(this.overlapDialogSprite, TILE_SCALE, this.scene); 

        return this;
    }

    applyScaling(obj: Phaser.GameObjects.Sprite, scale: number, scene: Phaser.Scene) 
    {
        let width = parseInt(scene.game.config.width.toString());
        let newWidth = width * scale;

        obj.displayWidth = newWidth;
        obj.scaleY = obj.scaleX;
    }

    setPositionX(x: number) 
    {
        this.spriteGroup.setX(x);
    }

    setPositionY(y: number) 
    {
        this.spriteGroup.setY(y);
    }

    setPosition(x: number, y: number) 
    {
        this.spriteGroup.setXY(x, y);
        this.spriteGroup.refresh();
        this.overlapDialogSprite.setPosition(x, y);
    }
}