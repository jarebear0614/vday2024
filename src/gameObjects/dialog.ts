export enum EndAction
{
    nop = "nop",

    incrementEvent = "incrementEvent",

    startScene = "startScene",

    giveLyricPiece = "giveLyricPiece",

    grantItem = "grantItem",

    clearItem = "clearItem"
}


export enum OverlapAction 
{
    nop = "nop",

    autoTrigger = "autoTrigger"
}

export class CharacterEventDialog
{
    eventKey: number = 0;

    dialog: string[] = [];

    onEnd: EndAction = EndAction.nop;

    scene?: string;

    fromX: number = 0;
    fromY: number = 0;

    item?: string;

    overlapAction: OverlapAction = OverlapAction.nop;
}

export class CharacterEvent
{
    events: CharacterEventDialog[];
}

export class CharacterEventUtility 
{
    static findEventByKey(CharacterEvent: CharacterEvent, key: number) : CharacterEventDialog | undefined
    {
        return CharacterEvent.events.find((e) => {
            return e.eventKey == key;
        });
    }
}