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
    messages: string[] = [];
    title?: string = undefined;
    endAction: EndAction = EndAction.nop;
    sourceCharacter?: Character;

    constructor(messages: string[], config?: InteractiveConfig) 
    {
        this.messages = messages;
        this.title = config?.title;
        this.endAction = config?.endAction ?? EndAction.nop;
        this.sourceCharacter = config?.sourceCharacter;
    }
}