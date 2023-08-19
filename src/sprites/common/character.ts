import { ResolutionVector2D } from "../../helper/engine/resolution-vector2D";
import { TempSprite } from "../temp-sprite";

export class Character extends TempSprite {
    constructor(name: string) {
        super("#ccc", name);
        this.Dimension = new ResolutionVector2D(200, 200);
    }

}
