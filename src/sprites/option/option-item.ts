import { IPointerListener } from "artistic-engine/event/event_groups";
import { TempSprite } from "../temp-sprite";
import { ResolutionVector2D } from "../../helper/engine/resolution-vector2D";
import { onClick } from "../../helper/engine/pointer-processor";

export class OptionItem extends TempSprite implements IPointerListener {
    public PointerRegistered: boolean = true;
    public RecieveEventsOutOfBound: boolean = false;

    private pointerId: number = -1;

    constructor(name: string, action: () => boolean = () => false) {
        super("orange", name);
        this.onPointer = onClick(action, () => true);
    }

    public onPointer(e: PointerEvent): boolean {  
        return false;        
    }
}
