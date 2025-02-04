import { Tetromino } from "./tetromino";

export class Field 
{
    private fieldLines: number[][];

    public fieldTopleft: Phaser.Math.Vector2;

    private readonly ghostTetrominoAlphaFactor = 0.25;

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

            console.log(this.fieldLines);
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
        this.surfaceHeights = new Array(this.width).fill(0);
        this.fieldLines = [];
        this.initializeInitialField();
    }

    private initializeInitialField() 
    {
        for(let i = 0; i < this.height; ++i)
        {
            this.addNewLine();
        }
    }

    private addNewLine() 
    {
        let newLine: number[] = new Array(this.width).fill(-1);
        this.fieldLines.push(newLine);
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
        for(let i = 0; i < 4; ++i)
        {
            let minoPosition = tetromino.get(i);
            let translatedMino = new Phaser.Math.Vector2(insertPosition.x + minoPosition.x, insertPosition.y + minoPosition.y);

            this.fieldLines[translatedMino.y][translatedMino.x] = tetromino.getTetrominoType();

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
}