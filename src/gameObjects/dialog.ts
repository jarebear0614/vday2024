export enum EndAction
{
    nop = 0,

    incrementEvent = 1
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