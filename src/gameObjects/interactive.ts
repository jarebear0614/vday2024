import { Character } from "./character";
import { EndAction } from "./dialog";
export class InteractiveConfig
{
    title?: string;
    endAction?: EndAction = EndAction.nop;
    sourceCharacter?: Character;
    sceneTransition?: SceneTransitionConfig;
}

export class InteractiveTriggerConfig
{
    type: string;

    scene?: SceneTransitionConfig;

    interactive?: Interactive | null;
}

export class SceneTransitionConfig
{
    toScene: string;
    fromX: number;
    fromY: number;
}

export class Interactive 
{
    type: string;
    messages: string[] = [];
    eventName?: string;
    eventKeyTrigger?: number;
    title?: string = undefined;
    endAction: EndAction = EndAction.nop;
    sourceCharacter?: Character;
    sceneTransition?: SceneTransitionConfig;

    constructor(messages: string[], type: string, eventName?: string, eventKeyTrigger?: number, config?: InteractiveConfig) 
    {
        this.type = type;
        this.messages = messages;
        this.eventName = eventName;
        this.eventKeyTrigger = eventKeyTrigger;
        this.title = config?.title;
        this.endAction = config?.endAction ?? EndAction.nop;
        this.sourceCharacter = config?.sourceCharacter;
        this.sceneTransition = config?.sceneTransition;
    }
}