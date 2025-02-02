
export class Interactive 
{
    messages: string[] = [];
    title?: string = undefined;

    constructor(messages: string[], title?: string) 
    {
        this.messages = messages;
        this.title = title;
    }
}