import { GameObjects } from 'phaser';
import { BaseScene } from './BaseScene';

export class MainMenu extends BaseScene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        super.create();

        this.background = this.add.image(0, 0, 'background').setOrigin(0, 0);

        this.background.displayWidth = this.getGameWidth();
        this.background.displayHeight = this.getGameHeight();

        this.input.once('pointerdown', () => {

            this.scene.start('Game');

        });
    }
}
