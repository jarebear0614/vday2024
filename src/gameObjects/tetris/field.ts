import { Tetris } from "../../scenes/Tetris";
import { Tetromino } from "./tetromino";

export class Field 
{
    private fieldLines: number[][];
    private minoImages: Phaser.GameObjects.Components.Transform[][];

    public fieldTopleft: Phaser.Math.Vector2;

    private surfaceHeights: number[] = [];

    private width: number;
    get blockWidth(): number
    {
        return this.width;
    }

    private height: number;
    get blockHeight(): number
    {
        return this.height;
    }

    constructor(fieldTopLeft: Phaser.Math.Vector2, blockWidth: number, blockHeight: number)
    {
        this.fieldTopleft = fieldTopLeft;
        this.width = blockWidth;
        this.height = blockHeight;
        this.surfaceHeights = new Array(this.width).fill(0);
        this.fieldLines = [];
        this.minoImages = [];
        this.initializeInitialField();
    }

    // Returns the number of lines cleared
    public clearLines() : number
    {
        let fullLines: number[] = [];

        for(let i = 0; i < this.height; ++i)
        {
            if(this.isLineFull(i))
            {
                fullLines.push(i);
            }
        }

        for(let i = 0; i < fullLines.length; ++i) 
        {
            this.fieldLines.splice(fullLines[i], 1);
            this.addNewLine();

            let removed = this.minoImages.splice(fullLines[i], 1);
            this.addNewLineImages();

            for(let i = 0; i < removed.length; ++i)
            {
                for(let j = 0; j < removed[i].length; ++j)
                {
                    if('destroy' in removed[i][j])
                    {
                        (<any>removed[i][j]).destroy();
                    }
                }
            }
        }        

        for(let i = 0; i < this.minoImages.length; ++i) 
        {
            for(let j = 0; j < this.minoImages[i].length; ++j)
            {
                if(this.minoImages[i][j] !== null)
                {
                    let count = fullLines.filter((n) => {
                        return i <= n;
                    });

                    this.minoImages[i][j].setY(this.fieldTopleft.y + (32 * Tetris.minoScale) * i);
                }
            }
        }

        if(fullLines.length > 0)
        {
            this.updateSurfaceHeights(0 - fullLines.length);
        }

        return fullLines.length;
    }

    public isLineFull(row: number): boolean
    {
        let isLineFull: boolean = true;

        for(let i = 0; i < this.width; ++i)
        {
            isLineFull = isLineFull && this.fieldLines[row][i] != -1;
        }

        return isLineFull;
    }

    public isInBounds(location: Phaser.Math.Vector2) : boolean
    {
        let isInBounds: boolean = true;

        if(location.x < 0 || location.y < 0 || location.x >= this.width || location.y >= this.height)
        {
            isInBounds = false;
        }

        return isInBounds;
    }

    public insertTetrominoAt(tetromino: Tetromino, point: Phaser.Math.Vector2)
    {
        if(this.isTetrominoInsertableAt(tetromino, point))
        {
            this.setMinos(tetromino, point);
            return true;
        }
        return false;
    }

    public isTetrominoInsertableAt(tetromino: Tetromino, insertPosition: Phaser.Math.Vector2) : boolean
    {
        let insertable: boolean = true;

        for(let i = 0; i < 4; ++i)
        {
            let minoPosition: Phaser.Math.Vector2 = tetromino.get(i);
            let translatedMino: Phaser.Math.Vector2 = new Phaser.Math.Vector2(insertPosition.x + minoPosition.x, insertPosition.y + minoPosition.y);
            
            insertable = insertable && (this.isInBounds(translatedMino) && this.fieldLines[translatedMino.y][translatedMino.x] == -1);
            
        }
        return insertable;
    }

    public isGameOver() : boolean
    {
        return this.isLockOut();
    }

    public getSurfaceHeights() : number[]
    {
        return this.surfaceHeights;
    }

    public getFieldData(): number[][]
    {
        return this.fieldLines;
    }

    public resetField()
    {
        this.destroyMinos();

        this.surfaceHeights = new Array(this.width).fill(0);
        this.fieldLines = [];
        this.minoImages = [];
        this.initializeInitialField();
    }

    private initializeInitialField() 
    {
        for(let i = 0; i < this.height; ++i)
        {
            this.addNewLine();
            this.addNewLineImages();
        }
    }

    private addNewLine() 
    {
        let newLine: number[] = new Array(this.width).fill(-1);
        this.fieldLines.unshift(newLine);
    }

    private addNewLineImages()
    {
        let newLine: Phaser.GameObjects.Components.Transform[] = new Array(this.width).fill(null);
        this.minoImages.unshift(newLine);
    }

    private updateSurfaceHeights(num: number)
    {
        for(let i = 0; i < this.width; ++i)
        {
            this.surfaceHeights[i] += num;
        }
    }

    private setMinos(tetromino: Tetromino, insertPosition: Phaser.Math.Vector2)
    {
        let transform = tetromino.transform;
        let minos = transform.removeChildren();

        for(let i = 0; i < 4; ++i)
        {
            let minoPosition = tetromino.get(i);
            let translatedMino = new Phaser.Math.Vector2(insertPosition.x + minoPosition.x, insertPosition.y + minoPosition.y);

            this.fieldLines[translatedMino.y][translatedMino.x] = tetromino.getTetrominoType();
            this.minoImages[translatedMino.y][translatedMino.x] = <unknown>minos[i] as Phaser.GameObjects.Components.Transform;

            this.surfaceHeights[translatedMino.x] = Math.max(this.height - translatedMino.y, this.surfaceHeights[translatedMino.x]);
        }
    }

    private containsMinos(row: number) : boolean
    {
        for(let i = 0; i < this.width; ++i)
        {
            if(this.fieldLines[row][i] != -1)
            {
                return true;
            }
        }

        return false;
    }

    private isLockOut(): boolean 
    {
        return this.containsMinos(0) || this.containsMinos(1);
    }

    private destroyMinos()
    {
        for(let i = 0; i < this.minoImages.length; ++i)
        {
            for(let j = 0; j < this.minoImages[j].length; ++j)
            {
                if(this.minoImages[i][j])
                {
                    (<any>this.minoImages[i][j]).destroy();
                }
            }
        }
    }
}