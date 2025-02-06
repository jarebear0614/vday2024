import { Character } from "./character";

export class GameEvent
{
    name: string;
    key: number = 0;
    characters: Character[] = [];

    constructor(name: string, key: number, characters?: Character[])
    {
        this.name = name;
        this.key = key;
        this.characters = characters ?? [];
    }

    activate() 
    {
        for(let character of this.characters)
        {
            if(character.getEventKeyTrigger() >= this.key && !character.isCreated())
            {
                character.create();
            }
        }
    }

    deactivate()
    {
        for(let character of this.characters)
        {
            //key + 1 because we assume on deactivate we're at the next event
            console.log(this.key + 1);
            if(character.isCreated() && this.key + 1 >= character.getEventKeyEnd())
            {
                character.tearDown();
            }
        }
    }

    update(delta: number)
    {
        for(let character of this.characters)
        {
            if(character.isCreated())
            {
                character.update(delta);
            }
        }
    }
}

export class GameEvents
{
    [key: string]: GameEvent[];
}

export class GameEventProgress
{
    [key: string]: number;
}

export class GameEventManager
{
    gameEvents: GameEvents = {};
    gameEventProgress: GameEventProgress = {};

    addEvent(name: string, eventKey: number, characters?: Character[])
    {
        if(!this.gameEvents[name])
        {
            this.gameEvents[name] = [];
        }

        if(!this.gameEventProgress[name])
        {
            this.gameEventProgress[name] = 0;
        }

        let existingEvent = this.findEventByNameAndKey(name, eventKey);

        if(existingEvent)
        {
            if(characters)
            {
                for(let character of characters)
                {
                    if(existingEvent.characters.indexOf(character) >= 0)
                    {
                        existingEvent.characters.push(character);
                    }
                }                
            }            
        }
        else
        {
            this.gameEvents[name].push(new GameEvent(name, eventKey, characters));
        }
    }

    incrementEvent(name: string)
    {
        let currentEvent = this.getCurrentEvent(name);
        currentEvent?.deactivate();

        if(this.gameEventProgress.hasOwnProperty(name))
        {
            this.gameEventProgress[name]++;
        }
    }

    findEventByNameAndKey(name: string, key: number) : GameEvent | undefined
    {
        if(!this.gameEvents[name])
        {
            return undefined;
        }

        return this.gameEvents[name].find((ev) => {
            return ev.name == name && ev.key == key;
        });
    }

    getCurrentEventProgress(name: string): number
    {
        return this.gameEventProgress[name];
    }

    getCurrentEvent(name: string) : GameEvent | undefined
    {
        let progress = this.gameEventProgress[name];
        return this.gameEvents[name].find((ev) =>
        {
            return ev.key == progress;
        });
    }

    getCurrentGameEvents() : GameEvent[]
    {
        let names = Object.keys(this.gameEvents);
        let events: GameEvent[] = [];

        for(let name of names)
        {            
            if(this.gameEventProgress.hasOwnProperty(name))
            {
                let found = this.getCurrentEventForName(name, this.gameEventProgress[name]);
                if(found)
                {
                    events.push(found);
                }
            }
        }

        return events;
    }

    private getCurrentEventForName(name: string, progress: number) : GameEvent | undefined
    {
        let events = this.gameEvents[name];
        let found =  events.find((ev: GameEvent) => {
            return ev.key == progress;
        });

        return found;
    }
}