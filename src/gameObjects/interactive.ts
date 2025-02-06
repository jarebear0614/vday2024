import { Character } from "./character";
import { EndAction } from "./dialog";
export class InteractiveConfig
{
    title?: string;
    endAction?: EndAction = EndAction.nop;
    sourceCharacter?: Character;
}

export class Interactive 
{
    type: string;
    messages: string[] = [];
    title?: string = undefined;
    endAction: EndAction = EndAction.nop;
    sourceCharacter?: Character;

    constructor(messages: string[], type: string, config?: InteractiveConfig) 
    {
        this.type = type;
        this.messages = messages;
        this.title = config?.title;
        this.endAction = config?.endAction ?? EndAction.nop;
        this.sourceCharacter = config?.sourceCharacter;
    }
}