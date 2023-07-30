import { IPointerListener } from "artistic-engine/event/event_groups";
import { TempSprite } from "../temp-sprite";
import { ResolutionVector2D } from "../../helper/engine/resolution-vector2D";

export class OptionItem extends TempSprite implements IPointerListener {
    public PointerRegistered: boolean = true;
    public RecieveEventsOutOfBound: boolean = false;

    private pointerId: number = -1;

    private action: (e: PointerEvent) => boolean

    constructor(name: string, action: (e: PointerEvent) => boolean = () => false) {
        super("orange", name);
        this.action = action;
    }

    public onPointer(e: PointerEvent): boolean {        
        if (e.type === "pointerdown") {
            this.pointerId = e.pointerId;
        } else if (e.type === "pointerup") {
            if (this.pointerId === e.pointerId) {   
                return this.action(e);
                // console.log(
                //     ResolutionVector2D.normalizeX(e.x - this.AbsoluteX), 
                //     ResolutionVector2D.normalizeY(e.y - this.AbsoluteY));
            }
        }
        return false;
        
    }
}
