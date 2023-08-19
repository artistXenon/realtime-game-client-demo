import { IPointerListener } from "artistic-engine/event/event_groups";
import { TempSprite } from "../temp-sprite";
import { onClick } from "../../helper/engine/pointer-processor";
import { Global } from "../../helper/global";

export class OptionItem extends TempSprite implements IPointerListener {
    public get PointerRegistered() {
        return true;
    }
    public RecieveEventsOutOfBound: boolean = false;
    public onPointer: (e: PointerEvent) => boolean;

    private key: string;

    constructor(name: string, action: () => void = () => {}) {
        super("orange", Global.getString(name));
        this.key = name;
        this.onPointer = onClick(action, () => true);
    }

    public override onDraw(context: CanvasRenderingContext2D, delay: number): void {
        if (this.key === "save_login") {
            this.color = Global.preferences.SaveLogin ? "skyblue" : "pink";
        }
        super.onDraw(context, delay);
    }
}
