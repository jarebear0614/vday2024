export class GameState 
{
    tilemap?: string = "meganshouse";

    spawnX?: number = 12;

    spawnY?: number = 5;

    tetrisScore?: number = 0;

    completedDots?: boolean = false;

    completedHangman?: boolean = false;

    fromScene?: string = '';

    lyricsPieces: number = 0;
}