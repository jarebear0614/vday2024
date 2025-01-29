import { Scene } from 'phaser';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;
    player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;

    xLimit: number = 0;
    yLimit: number = 0;

    playerVelocity: number = 250;

    constructor ()
    {
        super('Game');
    }

    preload() 
    {
        this.load.image('background-tiles', '/assets/map/background.png');
        this.load.tilemapTiledJSON('map', '/assets/map/main.tmj')

        this.load.image('player', 'assets/player.png');
        
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);
        
        const map = this.make.tilemap({key: 'map'});
        const tileset = map.addTilesetImage('background', 'background-tiles', 64, 64, 0, 0)!;
        map.createLayer('background', tileset, 0, 0);

        this.xLimit = map.widthInPixels;
        this.yLimit = map.heightInPixels;

        this.player = this.physics.add.sprite(100, 100, "player");
        this.cursors = this.input.keyboard?.createCursorKeys();

        this.input.once('pointerdown', () => {

            this.scene.start('GameOver');

        });
    }

    update() 
    {   
        this.player.setVelocity(0, 0);

        if (this.cursors?.up.isDown) 
        {
            this.player.setVelocityY(-this.playerVelocity);
        }
        if (this.cursors?.down.isDown) 
        {
            this.player.setVelocityY(this.playerVelocity);
        }

        if (this.cursors?.right.isDown) 
        {
            this.player.setVelocityX(this.playerVelocity);
        }
        if (this.cursors?.left.isDown) 
        {
            this.player.setVelocityX(-this.playerVelocity);
        }

        this.cameras.main.centerOn(this.player.x, this.player.y);      
        console.log(this.player.x);
        console.log(this.xLimit)  	;
        this.cameras.main.setBounds(0, 0, this.xLimit, this.yLimit);
    }
}
