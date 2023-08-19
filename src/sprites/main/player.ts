import { ResolutionVector2D } from "../../helper/engine/resolution-vector2D";
import { PlayerState } from "../../helper/type";
import { TempSprite } from "../temp-sprite";

export class MainMenuPlayer extends TempSprite {
    constructor(meta?: PlayerState) {
        super("#ccc", meta ? meta.name : "me"); // TODO: get local preference
        this.Dimension = new ResolutionVector2D(200, 200);
    }
}

/*
* change character // char
* lead  
*      kick // char
*      add bot // empty char
* private - change team (req to other player, accept) // char
*/