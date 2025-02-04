import { RandomBag } from "./randomBag";
import { Tetromino } from "./tetromino";

export class TetrominoMapping
{
    [key: string]: TetrominoData;
}

export class TetrominoWallKickData
{
    [key: string]: Phaser.Math.Vector2[];
}

export class TetrominoData
{
    public readonly rotationMatrix: Phaser.Math.Vector2[][];

    public readonly wallKickData: TetrominoWallKickData;

    constructor(rotationMatrix: Phaser.Math.Vector2[][], wallKickData: TetrominoWallKickData)
    {
        this.rotationMatrix = rotationMatrix;
        this.wallKickData = wallKickData;
    }
}

export class TetrominoFactory
{
    private static tetrominoNames: string[];

    private static tetrominoMapping: TetrominoMapping;

    private bag: RandomBag;

    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene)
    {
        this.scene = scene;
        this.bag = new RandomBag(6);

        TetrominoFactory.tetrominoNames =  ['o', 'i', 't', 'l', 'j', 's', 'z'];
        TetrominoFactory.tetrominoMapping = new TetrominoMapping();

        TetrominoFactory.tetrominoMapping['t'] = new TetrominoData(TetrominoFactory.TRotationMatrix, TetrominoFactory.JLSTZ_OffsetData);
        TetrominoFactory.tetrominoMapping['s'] = new TetrominoData(TetrominoFactory.SRotationMatrix, TetrominoFactory.JLSTZ_OffsetData);
        TetrominoFactory.tetrominoMapping['z'] = new TetrominoData(TetrominoFactory.ZRotationMatrix, TetrominoFactory.JLSTZ_OffsetData);
        TetrominoFactory.tetrominoMapping['o'] = new TetrominoData(TetrominoFactory.ORotationMatrix, {});
        TetrominoFactory.tetrominoMapping['i'] = new TetrominoData(TetrominoFactory.IRotationMatrix, TetrominoFactory.I_OffsetData);
        TetrominoFactory.tetrominoMapping['l'] = new TetrominoData(TetrominoFactory.LRotationMatrix, TetrominoFactory.JLSTZ_OffsetData);
        TetrominoFactory.tetrominoMapping['j'] = new TetrominoData(TetrominoFactory.JRotationMatrix, TetrominoFactory.JLSTZ_OffsetData);
    }

    public generateRandomTetromino(): Tetromino
    {
        let value = this.bag.next();
        let name = TetrominoFactory.tetrominoNames[value];
        let mapping: TetrominoData = TetrominoFactory.tetrominoMapping[name];

        return new Tetromino(this.scene, mapping.rotationMatrix, mapping.wallKickData, value);
    }

    public generateTetromino(s: string): Tetromino
    {
        let value = TetrominoFactory.tetrominoNames.indexOf(s);
        let name = TetrominoFactory.tetrominoNames[value];
        let mapping: TetrominoData = TetrominoFactory.tetrominoMapping[name];

        return new Tetromino(this.scene, mapping.rotationMatrix, mapping.wallKickData, value);
    }

    public flush()
    {
        this.bag.resetBag();
    }

    /*
        * The rotation matrix focuses on a single rotation Phaser.Math.Vector2. So for example in the T rotation matrix, the 0,0 Phaser.Math.Vector2 is always the
        * one marked with an 'R'
        * 
        *   [0]
        *    #
        *  # R #
        *   
        * The above format shows the # as normal Minos and the R as the rotation Phaser.Math.Vector2. That is the first rotation matrix or
        * the first row in the TRotationmatrix Array. The rest would be as follows
        * 
        *   [1]   [2]    [3]    
        *    #            #
        *  # R   # R #    R #
        *    #     #      # 
        *  
        * The rest of the pieces follow a similar path.
        */

    private static TRotationMatrix: Phaser.Math.Vector2[][] = [
        [new Phaser.Math.Vector2(0,0), new Phaser.Math.Vector2(-1,0), new Phaser.Math.Vector2(1, 0), new Phaser.Math.Vector2(0,-1)],
        [new Phaser.Math.Vector2(0,0), new Phaser.Math.Vector2(0,1), new Phaser.Math.Vector2(0,-1), new Phaser.Math.Vector2(1,0)],
        [new Phaser.Math.Vector2(0,0), new Phaser.Math.Vector2(1,0), new Phaser.Math.Vector2(-1, 0), new Phaser.Math.Vector2(0, 1)],
        [new Phaser.Math.Vector2(0,0), new Phaser.Math.Vector2(0,-1), new Phaser.Math.Vector2(0,1), new Phaser.Math.Vector2(-1, 0)]
    ];

    private static SRotationMatrix: Phaser.Math.Vector2[][] = [
        [new Phaser.Math.Vector2(0,0), new Phaser.Math.Vector2(-1,0), new Phaser.Math.Vector2(0,-1), new Phaser.Math.Vector2(1,-1)],
        [new Phaser.Math.Vector2(0,0), new Phaser.Math.Vector2(0,-1), new Phaser.Math.Vector2(1,0), new Phaser.Math.Vector2(1,1)],
        [new Phaser.Math.Vector2(0,0), new Phaser.Math.Vector2(1,0), new Phaser.Math.Vector2(0,1), new Phaser.Math.Vector2(-1,1)],
        [new Phaser.Math.Vector2(0,0), new Phaser.Math.Vector2(-1,0), new Phaser.Math.Vector2(-1,-1), new Phaser.Math.Vector2(0,1)]
    ];

    private static ZRotationMatrix: Phaser.Math.Vector2[][] = [
        [new Phaser.Math.Vector2(0,0), new Phaser.Math.Vector2(1,0), new Phaser.Math.Vector2(0,-1), new Phaser.Math.Vector2(-1,-1)],
        [new Phaser.Math.Vector2(0,0), new Phaser.Math.Vector2(0,1), new Phaser.Math.Vector2(1,0), new Phaser.Math.Vector2(1,-1)],
        [new Phaser.Math.Vector2(0,0), new Phaser.Math.Vector2(-1,0), new Phaser.Math.Vector2(0,1), new Phaser.Math.Vector2(1,1)],
        [new Phaser.Math.Vector2(0,0), new Phaser.Math.Vector2(0,-1), new Phaser.Math.Vector2(-1,0), new Phaser.Math.Vector2(-1,1)]
    ];

    private static ORotationMatrix: Phaser.Math.Vector2[][] = [
        [new Phaser.Math.Vector2(0,0), new Phaser.Math.Vector2(1,0), new Phaser.Math.Vector2(0,-1), new Phaser.Math.Vector2(1,-1)],
        [new Phaser.Math.Vector2(0,0), new Phaser.Math.Vector2(1,0), new Phaser.Math.Vector2(0,-1), new Phaser.Math.Vector2(1,-1)],
        [new Phaser.Math.Vector2(0,0), new Phaser.Math.Vector2(1,0), new Phaser.Math.Vector2(0,-1), new Phaser.Math.Vector2(1,-1)],
        [new Phaser.Math.Vector2(0,0), new Phaser.Math.Vector2(1,0), new Phaser.Math.Vector2(0,-1), new Phaser.Math.Vector2(1,-1)]
    ];

    private static IRotationMatrix: Phaser.Math.Vector2[][] = [
        [new Phaser.Math.Vector2(0,0), new Phaser.Math.Vector2(-1,0), new Phaser.Math.Vector2(1,0), new Phaser.Math.Vector2(2,0)],
        [new Phaser.Math.Vector2(1,0), new Phaser.Math.Vector2(1,-1), new Phaser.Math.Vector2(1,1), new Phaser.Math.Vector2(1,2)],
        [new Phaser.Math.Vector2(0,0), new Phaser.Math.Vector2(-1,0), new Phaser.Math.Vector2(1,0), new Phaser.Math.Vector2(2,0)],
        [new Phaser.Math.Vector2(0,0), new Phaser.Math.Vector2(0,-1), new Phaser.Math.Vector2(0,-2), new Phaser.Math.Vector2(0,1)]
    ];

    private static LRotationMatrix: Phaser.Math.Vector2[][] = [
        [new Phaser.Math.Vector2(0,0), new Phaser.Math.Vector2(1,0), new Phaser.Math.Vector2(-1,0), new Phaser.Math.Vector2(1,-1)],
        [new Phaser.Math.Vector2(0,0), new Phaser.Math.Vector2(0,-1), new Phaser.Math.Vector2(0,1), new Phaser.Math.Vector2(1,1)],
        [new Phaser.Math.Vector2(0,0), new Phaser.Math.Vector2(-1,0), new Phaser.Math.Vector2(1,0), new Phaser.Math.Vector2(-1,1)],
        [new Phaser.Math.Vector2(0,0), new Phaser.Math.Vector2(0,1), new Phaser.Math.Vector2(0,-1), new Phaser.Math.Vector2(-1,-1)]
    ];

    private static JRotationMatrix: Phaser.Math.Vector2[][] = [
        [new Phaser.Math.Vector2(0,0), new Phaser.Math.Vector2(-1,0), new Phaser.Math.Vector2(1,0), new Phaser.Math.Vector2(-1,-1)],
        [new Phaser.Math.Vector2(0,0), new Phaser.Math.Vector2(0,1), new Phaser.Math.Vector2(0,-1), new Phaser.Math.Vector2(1,-1)],
        [new Phaser.Math.Vector2(0,0), new Phaser.Math.Vector2(1,0), new Phaser.Math.Vector2(-1,0), new Phaser.Math.Vector2(1,1)],
        [new Phaser.Math.Vector2(0,0), new Phaser.Math.Vector2(0,-1), new Phaser.Math.Vector2(0,1), new Phaser.Math.Vector2(-1,1)]
    ];

    private static JLSTZ_OffsetData: TetrominoWallKickData =
    {
        'Kick_0R': [ new Phaser.Math.Vector2(-1, 0), new Phaser.Math.Vector2 (-1, -1), new Phaser.Math.Vector2(0, 2), new Phaser.Math.Vector2(-1, 2) ],
        'Kick_R0': [ new Phaser.Math.Vector2(1, 0), new Phaser.Math.Vector2 (1, 1), new Phaser.Math.Vector2(0, -2), new Phaser.Math.Vector2(1, -2) ],

        'Kick_R2': [ new Phaser.Math.Vector2(1, 0), new Phaser.Math.Vector2 (1, -1), new Phaser.Math.Vector2(0, 2), new Phaser.Math.Vector2(1, -2) ],
        'Kick_2R': [ new Phaser.Math.Vector2(-1, 0), new Phaser.Math.Vector2 (-1, -1), new Phaser.Math.Vector2(0, 2), new Phaser.Math.Vector2(-1, 2) ],

        'Kick_2L': [ new Phaser.Math.Vector2(1, 0), new Phaser.Math.Vector2 (1, -1), new Phaser.Math.Vector2(0, 2), new Phaser.Math.Vector2(1, 2) ],
        'Kick_L2': [ new Phaser.Math.Vector2(-1, 0), new Phaser.Math.Vector2 (-1, 1), new Phaser.Math.Vector2(0, -2), new Phaser.Math.Vector2(-1, -2) ],

        'Kick_L0': [ new Phaser.Math.Vector2(-1, 0), new Phaser.Math.Vector2 (-1, 1), new Phaser.Math.Vector2(0, -2), new Phaser.Math.Vector2(-1, -2) ],
        'Kick_0L': [ new Phaser.Math.Vector2(1, 0), new Phaser.Math.Vector2 (1, -1), new Phaser.Math.Vector2(0, 2), new Phaser.Math.Vector2(1, 2) ]
    };

    private static I_OffsetData: TetrominoWallKickData =
    {
        'Kick_0R': [ new Phaser.Math.Vector2(-2, 0), new Phaser.Math.Vector2 (1, 0), new Phaser.Math.Vector2(-2, 1), new Phaser.Math.Vector2(1, -2) ],
        'Kick_R0': [ new Phaser.Math.Vector2(2, 0), new Phaser.Math.Vector2 (-1, 0), new Phaser.Math.Vector2(2, -1), new Phaser.Math.Vector2(-1, 2) ],

        'Kick_R2': [ new Phaser.Math.Vector2(-1, 0), new Phaser.Math.Vector2 (2, 0), new Phaser.Math.Vector2(-1, -2), new Phaser.Math.Vector2(2, 1) ],
        'Kick_2R': [ new Phaser.Math.Vector2(1, 0), new Phaser.Math.Vector2 (-2, 0), new Phaser.Math.Vector2(1, 2), new Phaser.Math.Vector2(-2, -1) ],

        'Kick_2L': [ new Phaser.Math.Vector2(2, 0), new Phaser.Math.Vector2 (-1, 0), new Phaser.Math.Vector2(2, -1), new Phaser.Math.Vector2(-1, 2) ],
        'Kick_L2': [ new Phaser.Math.Vector2(-2, 0), new Phaser.Math.Vector2 (1, 0), new Phaser.Math.Vector2(-2, 1), new Phaser.Math.Vector2(1, -2) ],

        'Kick_L0': [ new Phaser.Math.Vector2(1, 0), new Phaser.Math.Vector2 (-2, 0), new Phaser.Math.Vector2(1, 2), new Phaser.Math.Vector2(-2, -1) ],
        'Kick_0L': [ new Phaser.Math.Vector2(-1, 0), new Phaser.Math.Vector2 (2, 0), new Phaser.Math.Vector2(-1, -2), new Phaser.Math.Vector2(2, 1) ]
    };
}