import { GameState } from '../gameObjects/GameState';
import { BaseScene } from './BaseScene';
import { GameObjects, Math as PhaserMath } from 'phaser';

export class Hangman extends BaseScene
{
    gameState: GameState = {lyricsPieces: 0};

    possibleWords: string[] = ['INFINITY', 'FEBRUARY', 'BABYGIRL'];

    letterRectangles: GameObjects.Rectangle[] = [];

    body: GameObjects.Components.Visible[] = []; 

    currentWord: string = this.possibleWords[0];

    wordPanelLocation: PhaserMath.Vector2 = PhaserMath.Vector2.ZERO;

    selectedLetter: string | null = null;
    selectedRectangle: GameObjects.Rectangle | null = null;

    playButton: GameObjects.Rectangle;

    letterGlyphs: GameObjects.Text[] = []; 
    wordRectangles: GameObjects.Rectangle[] = [];

    wrongGuesses: number = 0;
    correctLetters: number = 0;

    private menuGroup: Phaser.Physics.Arcade.StaticGroup;

    constructor()
    {
        super('Hangman');
    }

    init(data: any)
    {
        //this.cameras.main.fadeOut(1);
        if(data && data.gameState && data.gameState instanceof GameState) 
        {
            this.gameState = data.gameState;
        }

        // this.load.on('progress', (progress: number) => 
        // {
        //     if(progress >= 1) 
        //     {
        //         this.cameras.main.fadeIn(300);
        //     }
        // });
    }

    preload()
    {

    }

    create()
    {
        super.create();

        this.cameras.main.setBackgroundColor(0xddebed);

        let platform = this.add.rectangle(0, 0, this.getGameWidth() * 0.65, this.getGameHeight() * 0.03, 0x000000).setOrigin(0, 0);
        platform.setPosition(this.getGameWidth() / 2 - platform.displayWidth / 2, this.getGameHeight() * 0.75);

        let pole = this.add.rectangle(0, 0, this.getGameWidth() * 0.02, this.getGameHeight() * 0.45, 0x000000).setOrigin(0, 0);
        pole.setPosition( platform.x + (platform.displayWidth * 0.20), platform.y - pole.displayHeight);

        let arch = this.add.rectangle(0, 0, platform.displayWidth * 0.50, pole.displayWidth, 0x000000).setOrigin(0, 0);
        arch.setPosition( pole.x + pole.displayWidth, pole.y);

        let hanginPole = this.add.rectangle(0, 0, pole.displayWidth, this.getGameHeight() * 0.13, 0x000000).setOrigin(0, 0);
        hanginPole.setPosition(arch.x + arch.displayWidth - hanginPole.displayWidth, arch.y);

        let lettersPanelWidth = this.getGameWidth() * 0.80;
        let lettersX = this.getGameWidth() / 2 - lettersPanelWidth / 2;
        let lettersY = this.getGameHeight() * 0.02;

        //let lettersPanel = this.add.rectangle(lettersX, lettersY, lettersPanelWidth, this.getGameHeight() * 0.22).setStrokeStyle(2, 0x000000, 1.0).setOrigin(0, 0);

        let lettersPerLine = 8;
        let padding = 10;

        let currentLetterX = lettersX + padding;
        let currentLetterY = lettersY + padding;
        let letterWidth = (lettersPanelWidth - lettersPerLine * padding) / lettersPerLine;
        
        let row: GameObjects.Rectangle[] = [];
        let letterRow: GameObjects.Text[] = [];

        let letterCode = 65;
        let rows = 1;
        for(let i = 0; i < 26; ++i)
        {
            let letterRect = this.add.rectangle(currentLetterX, currentLetterY, letterWidth, letterWidth).setStrokeStyle(2, 0x000000, 1).setOrigin(0, 0).setInteractive();
            let letter = this.add.text(currentLetterX, currentLetterY, String.fromCharCode(letterCode), {
                fontSize: this.getGameWidth() * 0.08,
                color: '#000000'
            });

            letter.setPosition(letter.x + letterWidth / 2 - letter.displayWidth / 2, letter.y + letterWidth / 2 - letter.displayHeight / 2);

            currentLetterX += letterWidth + padding;

            row.push(letterRect);
            letterRow.push(letter);

            if( (i + 1) % lettersPerLine == 0)
            {
                currentLetterX = lettersX + padding;
                currentLetterY += letterWidth + padding;

                row.splice(0, row.length);
                letterRow.splice(0, letterRow.length);

                rows++;
            }

            this.letterRectangles.push(letterRect);
            letterCode++;

            letterRect.addListener('pointerup', () => 
            {
                this.selectedLetter = letter.text;

                if(this.selectedRectangle)
                {
                    this.selectedRectangle.setFillStyle(0x00FF00, 0);
                }

                this.selectedRectangle = letterRect;
                this.selectedRectangle.setFillStyle(0x00FF00, 0.75);
            })
        }

        
        let rowWidth = row.length * letterWidth + row.length * padding;
        let centerX = lettersX + lettersPanelWidth / 2 - rowWidth / 2;
        let diff = centerX - lettersX;

        for(let i = 0; i < row.length; ++i)
        {
            row[i].setPosition(row[i].x + diff, row[i].y);
            letterRow[i].setPosition(letterRow[i].x + diff, letterRow[i].y);
        }

        let headWidth = this.getGameWidth() * 0.10;
        let head = this.add.ellipse(hanginPole.x - headWidth / 2 + hanginPole.displayWidth / 2, hanginPole.y + hanginPole.displayHeight, headWidth, headWidth).setStrokeStyle(2, 0x000000).setOrigin(0, 0);
        this.body.push(head);

        let torso = this.add.rectangle(hanginPole.x, head.y + head.displayHeight, hanginPole.width * 0.50, this.getGameHeight() * 0.07, 0x000000).setOrigin(0, 0);
        this.body.push(torso);

        let armWidth = this.getGameWidth() * 0.08;
        let armHeight = torso.displayHeight * 0.35;
        let leftArm = this.add.line(0, 0, torso.x - armWidth, torso.y + torso.displayHeight / 2 - armHeight, torso.x, torso.y + torso.displayHeight / 2, 0x000000).setLineWidth(3, 3).setOrigin(0, 0);
        this.body.push(leftArm);

        let rightArm = this.add.line(0, 0, torso.x, torso.y + torso.displayHeight / 2, torso.x + armWidth, torso.y + torso.displayHeight / 2 - armHeight, 0x000000).setLineWidth(3, 3).setOrigin(0, 0);
        this.body.push(rightArm);

        let legHeight = torso.displayHeight * 0.85;
        let leftLeg = this.add.line(0, 0, torso.x + torso.displayWidth / 2, torso.y + torso.displayHeight, torso.x - armWidth / 2, torso.y + torso.displayHeight + legHeight, 0x000000).setLineWidth(4, 4).setOrigin(0, 0);
        this.body.push(leftLeg);

        let rightLeg = this.add.line(0, 0, torso.x + torso.displayWidth / 2, torso.y + torso.displayHeight, torso.x + armWidth / 2, torso.y + torso.displayHeight + legHeight, 0x000000).setLineWidth(4, 4).setOrigin(0, 0);
        this.body.push(rightLeg);

        this.wordPanelLocation = new PhaserMath.Vector2(lettersX, this.getGameHeight() * 0.90);

        this.playButton = this.add.rectangle(0, 0, this.getGameWidth() * 0.35, this.getGameHeight() * 0.05).setStrokeStyle(3, 0x000000, 1).setOrigin(0, 0).setInteractive();
        this.playButton.setPosition(this.getGameWidth() / 2 - this.playButton.displayWidth / 2, lettersY + (letterWidth * rows) + (padding * rows) + 15 * 0.80);

        let playLetterText = this.add.text(0, 0, 'Play Letter', { fontSize: 22, color: '#000000'});
        playLetterText.setPosition(this.playButton.x + this.playButton.displayWidth / 2 - playLetterText.displayWidth / 2, this.playButton.y + this.playButton.displayHeight / 2 - playLetterText.displayHeight / 2);


        this.playButton.addListener('pointerup', () => 
        {
            if(!this.selectedLetter)
            {
                return;
            }

            this.playLetter(this.selectedLetter);
        });

        this.createMainMenu();
        this.setUpGame();
    }

    createMainMenu() 
    {
        this.menuGroup = this.physics.add.staticGroup();

        let modal = this.add.rectangle(0, 0, this.getGameWidth(), this.getGameHeight(), 0x000000, 0.45).setOrigin(0, 0);

        let rectWidth = this.getGameWidth() * 0.45;
        let rectHeight = this.getGameHeight() * 0.05;
        let playRect = this.add.rectangle(this.getGameWidth() / 2 - rectWidth / 2, this.getGameHeight() * 0.45, rectWidth, rectHeight, 0x999999)
                                .setOrigin(0, 0)
                                .setStrokeStyle(3, 0x000000)
                                .setInteractive();

        let playText = this.add.text(0, 0, 'play', { fontSize: 24, color: '#ffffff' })
        playText.setPosition(playRect.x + playRect.displayWidth / 2 - playText.displayWidth / 2, playRect.y + playRect.displayHeight / 2 - playText.displayHeight / 2,);

        let quitRect = this.add.rectangle(this.getGameWidth() / 2 - rectWidth / 2, playRect.y + playRect.displayHeight + 10, rectWidth, rectHeight, 0x999999)
                                .setOrigin(0, 0)
                                .setStrokeStyle(3, 0x000000)
                                .setInteractive();

        let quitText = this.add.text(0, 0, 'quit', { fontSize: 24, color: '#ffffff' })
        quitText.setPosition(quitRect.x + quitRect.displayWidth / 2 - playText.displayWidth / 2, quitRect.y + quitRect.displayHeight / 2 - quitText.displayHeight / 2,);
        
        playRect.addListener('pointerover', () =>
        {
            playRect.fillColor = 0x777777;
        });

        playRect.addListener('pointerout', () =>
        {
            playRect.fillColor = 0x999999;
        });

        playRect.addListener('pointerdown', () =>
        {
            this.menuGroup.setVisible(false);
            this.setUpGame();
        });

        quitRect.addListener('pointerover', () =>
        {
            quitRect.fillColor = 0x777777;
        });

        quitRect.addListener('pointerout', () =>
        {
            quitRect.fillColor = 0x999999;
        });

        quitRect.addListener('pointerdown', () =>
        {
            this.gameState.fromScene = this.scene.key;

            this.scene.start('Game', {
                gameState: this.gameState
            });
        });

        this.menuGroup.add(modal, false);
        this.menuGroup.add(playRect, false);
        this.menuGroup.add(playText, false);
        this.menuGroup.add(quitRect, false);
        this.menuGroup.add(quitText, false);
    }

    setUpGame()
    {
        this.destroyPreviousGame();

        this.correctLetters = 0;
        this.wrongGuesses = 0;

        let idx = Math.round(Math.random()*(this.possibleWords.length - 1));
        this.currentWord = this.possibleWords[idx];

        let wordPanelWidth = this.getGameWidth() * 0.80;
        let lettersPerLine = 9;
        let wordLetterPadding = 10 * (wordPanelWidth / this.getGameWidth());
        let wordLetterWidth = (wordPanelWidth - lettersPerLine * wordLetterPadding) / lettersPerLine;

        let currentX = this.getGameWidth() / 2 - (wordLetterWidth * this.currentWord.length + wordLetterPadding * (this.currentWord.length - 1)) / 2;
        let currentY = this.wordPanelLocation.y;

        //this.add.rectangle(currentX, currentY, wordLetterWidth * this.currentWord.length + wordLetterPadding * (this.currentWord.length - 1), 100).setStrokeStyle(2, 0x000000, 1).setOrigin(0, 0);

        for(let i = 0; i < this.currentWord.length; ++i)
        {
            let letter = this.currentWord[i];

            let rect = this.add.rectangle(currentX, currentY, wordLetterWidth, this.getGameHeight() * 0.01, 0x000000).setOrigin(0, 0);
            let glyph = this.add.text(0, 0, letter, {fontSize: 32, color: '#000000'});
            
            glyph.setPosition(rect.x + rect.displayWidth / 2 - glyph.displayWidth / 2, rect.y - glyph.displayHeight);

            currentX += wordLetterWidth + wordLetterPadding;

            this.letterRectangles.push(rect);
            this.letterGlyphs.push(glyph);
        }

        for(let glyph of this.letterGlyphs)
        {
            glyph.setVisible(false);
        }
    }

    destroyPreviousGame()
    {
        for(let piece of this.body)
        {
            piece.setVisible(false);
        }

        for(let i = 0; i < this.letterGlyphs.length; ++i)
        {
            this.letterGlyphs[i].destroy();
            this.letterRectangles[i].destroy();
        }

        this.letterGlyphs = [];
        this.letterRectangles = [];
    }

    playLetter(letter: string) 
    {
        let success: boolean = false;
        for(let i = 0; i < this.currentWord.length; ++i)
        {
            if(this.currentWord[i] === letter && !this.letterGlyphs[i].visible)
            {
                success = true;

                this.letterGlyphs[i].setVisible(true);
                this.correctLetters++;
            }
        }

        if(!success)
        {
            this.body[this.wrongGuesses].setVisible(true);
            this.wrongGuesses++;

            if(this.wrongGuesses == this.body.length)
            {
                this.endGame();
            }
        }

        if(this.correctLetters === this.currentWord.length)
        {
            this.gameState.completedHangman = true;
            this.endGame();
        }

        if(this.selectedRectangle)
        {
            this.selectedRectangle.setFillStyle(0x00FF00, 0);
        }
        
        this.selectedRectangle = null;
        this.selectedLetter = null;
    }

    endGame()
    {
        this.menuGroup.setVisible(true);
    }
}