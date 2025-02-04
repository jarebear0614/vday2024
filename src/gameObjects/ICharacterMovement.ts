import { Character } from "./character";

export interface ICharacterMovement 
{
    pause() : void;
    unpause() : void;
    
    setCharacter(character: Character) : void;
    update(delta: number) : void;
}