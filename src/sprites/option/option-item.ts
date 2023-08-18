import { IPointerListener } from "artistic-engine/event/event_groups";
import { TempSprite } from "../temp-sprite";
import { onClick } from "../../helper/engine/pointer-processor";

export class OptionItem extends TempSprite implements IPointerListener {
    public PointerRegistered: boolean = true;
    public RecieveEventsOutOfBound: boolean = false;
    public onPointer: (e: PointerEvent) => boolean;

    constructor(name: string, action: () => boolean = () => false) {
        super("orange", name);
        this.onPointer = onClick(action, () => true);
    }
}
