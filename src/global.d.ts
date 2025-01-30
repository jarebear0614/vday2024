// images
declare module '*.apng' {
    const src: string
    export default src
}
declare module '*.png' {
    const src: string
    export default src
}
declare module '*.jpg' {
    const src: string
    export default src
}
declare module '*.jpeg' {
    const src: string
    export default src
}
declare module '*.jfif' {
    const src: string
    export default src
}
declare module '*.pjpeg' {
    const src: string
    export default src
}
declare module '*.pjp' {
    const src: string
    export default src
}
declare module '*.gif' {
    const src: string
    export default src
}
declare module '*.svg' {
    const src: string
    export default src
}
declare module '*.ico' {
    const src: string
    export default src
}
declare module '*.webp' {
    const src: string
    export default src
}
declare module '*.avif' {
    const src: string
    export default src
}

// Shaders
declare module '*.frag' {
    const src: string
    export default src
}
declare module '*.vert' {
    const src: string
    export default src
}
declare module '*.glsl' {
    const src: string
    export default src
}
declare module '*.vs' {
    const src: string
    export default src
}
declare module '*.fs' {
    const src: string
    export default src
}

declare module 'phaser-ui-tools' {    

    export enum Alignment {
        TOP_LEFT = 0,
        TOP_CENTER = 1,
        TOP_RIGHT = 2,
        LEFT_TOP = 3,
        LEFT_CENTER = 4,
        LEFT_BOTTOM = 5,
        CENTER = 6,
        RIGHT_TOP = 7,
        RIGHT_CENTER = 8,
        RIGHT_BOTTOM = 9,
        BOTTOM_LEFT = 10,
        BOTTOM_CENTER = 11,
        BOTTOM_RIGHT = 12,
    }
    

    export class Group extends Phaser.GameObjects.Container {

    }

    export class Frame  extends Group{
        constructor(game: Phaser.Scene, x?: number, y?: number, bg?: string, modal?: boolean);

        dismiss() : void;

        addNode(node: Object, paddingX?: number, paddingY?: number, alignment?: Alignment) : void;
    }

    export class Row extends Frame {
        
    }

    export class Column extends Frame {

    }

    export class VectorPoint {
        constructor(x?: number, y?:number, z?:number, sprite?: Object, position?: number);

        x: number;
        y: number;
        z: number;

    }

    export class Wheel3D {
        constructor(game: Phaser.Scene, xy: Object, sprites: any[], firstPlace: number, zoom: number, axis: string, rotations: Object, visibleRange: Object | null, tweenParams: Object)
    }
}