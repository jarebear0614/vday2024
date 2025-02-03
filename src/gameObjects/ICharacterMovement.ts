import { Character } from "./character";

export interface ICharacterMovement 
{
    setCharacter(character: Character) : void;
    update(delta: number) : void;
}