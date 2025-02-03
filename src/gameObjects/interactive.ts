import { EndAction } from "./dialog";

export class Interactive 
{
    messages: string[] = [];
    title?: string = undefined;
    endAction: EndAction = EndAction.nop;

    constructor(messages: string[], endAction: EndAction = EndAction.nop, title?: string) 
    {
        this.messages = messages;
        this.title = title;
        this.endAction = endAction;
    }
}