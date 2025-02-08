import { GameState } from '../gameObjects/GameState';
import { Align } from '../util/align';
import { BaseScene } from './BaseScene';

export class Dot 
{
    start: Phaser.Math.Vector2;
    size: number;

    constructor(start: Phaser.Math.Vector2, size: number)
    {
        this.start = start;
        this.size = size;
    }
}

export class Dots extends BaseScene
{
    gameState: GameState;

    dotsbackground: Phaser.GameObjects.Image;
    dadBackground: Phaser.GameObjects.Image;

    down: boolean = false;
    downPosition: Phaser.Math.Vector2;

    dots: Dot[] = [];

    readonly buildWidth: number = 448;
    readonly buildHeight: number = 927;

    scaleX: number = 1.0;
    scaleY: number = 1.0;

    selectedRectangle: Phaser.GameObjects.Rectangle | null = null;

    currentDot: number = 1;

    constructor ()
    {
        super('Dots');
    }

    init(data: any) 
    {
        this.cameras.main.fadeOut(1);
        this.cameras.main.setBackgroundColor(0xFFFFFF);   
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

        this.dots = JSON.parse('[{"start":{"x":234,"y":110},"size":12},{"start":{"x":276,"y":132},"size":12},{"start":{"x":296,"y":175},"size":12},{"start":{"x":282,"y":179},"size":12},{"start":{"x":275,"y":289},"size":12},{"start":{"x":365,"y":324},"size":12},{"start":{"x":409,"y":444},"size":12},{"start":{"x":408,"y":541},"size":12},{"start":{"x":356,"y":540},"size":12},{"start":{"x":355,"y":568},"size":12},{"start":{"x":344,"y":578},"size":12},{"start":{"x":360,"y":697},"size":12},{"start":{"x":340,"y":800},"size":12},{"start":{"x":322,"y":822},"size":12},{"start":{"x":175,"y":821},"size":12},{"start":{"x":138,"y":765},"size":12},{"start":{"x":102,"y":653},"size":12},{"start":{"x":119,"y":606},"size":12},{"start":{"x":118,"y":544},"size":12},{"start":{"x":56,"y":554},"size":12},{"start":{"x":33,"y":526},"size":12},{"start":{"x":39,"y":487},"size":12},{"start":{"x":26,"y":456},"size":12},{"start":{"x":81,"y":333},"size":12},{"start":{"x":135,"y":304},"size":12},{"start":{"x":27,"y":139},"size":12},{"start":{"x":28,"y":119},"size":12},{"start":{"x":47,"y":117},"size":12},{"start":{"x":100,"y":205},"size":12},{"start":{"x":154,"y":291},"size":12},{"start":{"x":179,"y":285},"size":12},{"start":{"x":185,"y":246},"size":12},{"start":{"x":164,"y":200},"size":12},{"start":{"x":175,"y":131},"size":12},{"start":{"x":201,"y":111},"size":12}]');
    }

    preload()
    {
        this.load.image('dots', 'assets/daddots.png');
        this.load.image('dad', 'assets/daddots_full.png');
    }

    create ()
    {
        super.create();

        this.scaleX = this.getGameWidth() / this.buildWidth;
        this.scaleY = this.getGameHeight() / this.buildHeight;

        this.dotsbackground = this.add.image(0, 0, 'dots').setOrigin(0, 0);

        let height = this.getGameHeight();
        this.dotsbackground.displayHeight = height * 0.90;
        this.dotsbackground.displayWidth = this.getGameWidth() * 2.3;

        this.dotsbackground.setPosition(this.getGameWidth() / 2 - this.dotsbackground.displayWidth / 2, this.getGameHeight() / 2 - this.dotsbackground.displayHeight / 2)
                    
                    .setInteractive()
                    .addListener('pointerup', (pointer: any) =>
                    {
                        if(!this.down)
                        {
                            this.downPosition = new Phaser.Math.Vector2(pointer.position.x, pointer.position.y);

                            let rectX = this.dots[this.currentDot - 1].start.x * this.scaleX;
                            let rectY = this.dots[this.currentDot - 1].start.y * this.scaleY;
                            let sizeX = this.dots[this.currentDot - 1].size * this.scaleX * 10;
                            let sizeY = this.dots[this.currentDot - 1].size * this.scaleY * 10;
                            if(
                                this.downPosition.x >= rectX && this.downPosition.x <= rectX + sizeX &&
                                this.downPosition.y >= rectY && this.downPosition.y <= rectY + sizeY
                            )
                            {
                                this.selectedRectangle = this.add.rectangle(rectX, rectY, sizeX / 10, sizeY / 10)
                                        .setOrigin(0, 0)
                                        .setFillStyle(0xffffff, 0.3)
                                        .setStrokeStyle(2, 0x000000, 1.0);

                                this.downPosition.x = rectX;
                                this.downPosition.y = rectY;

                                this.down = true;
                            }
                        }
                        else if(this.down)
                        {
                            if(this.selectedRectangle)
                            {
                                let rectX = this.dots[this.currentDot % this.dots.length].start.x * this.scaleX;
                                let rectY = this.dots[this.currentDot % this.dots.length].start.y * this.scaleY;
                                let sizeX = this.dots[this.currentDot % this.dots.length].size * this.scaleX * 10;
                                let sizeY = this.dots[this.currentDot % this.dots.length].size * this.scaleY * 10;
                                if(
                                    pointer.position.x >= rectX && pointer.position.x <= rectX + sizeX &&
                                    pointer.position.y >= rectY && pointer.position.y <= rectY + sizeY
                                 )
                                 {
                                    this.add.line(0, 0, this.downPosition.x, this.downPosition.y, rectX + sizeX / (10 * 2), rectY + sizeY / (10 * 2), 0x000000, 1.0).setOrigin(0, 0);
                                    this.currentDot++;

                                    this.selectedRectangle.destroy();
                                    this.selectedRectangle = null;

                                    this.selectedRectangle = this.add.rectangle(rectX, rectY, sizeX / 10, sizeY / 10)
                                        .setOrigin(0, 0)
                                        .setFillStyle(0xffffff, 0.3)
                                        .setStrokeStyle(2, 0x000000, 1.0);

                                    this.downPosition.x = rectX;
                                    this.downPosition.y = rectY;

                                    if(this.currentDot == this.dots.length + 1)
                                    {
                                        this.add.tween({
                                            targets: this.dadBackground,
                                            duration: 1000,
                                            alpha: 1
                                        });
                                    }
                                 }
                            }
                        }
                    });


        this.dadBackground = this.add.image(this.dotsbackground.x, this.dotsbackground.y, 'dad').setOrigin(0, 0).setAlpha(0)
        this.dadBackground.setScale(this.dotsbackground.scaleX, this.dotsbackground.scaleY);
    }

    update()
    {
    }
}
