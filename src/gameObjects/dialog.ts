export enum EndAction
{
    nop = "nop",

    incrementEvent = "incrementEvent",

    startScene = "startScene",

    giveLyricPiece = "giveLyricPiece"
}

export class CharacterEventDialog
{
    eventKey: number = 0;

    dialog: string[] = [];

    onEnd: EndAction = EndAction.nop;
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