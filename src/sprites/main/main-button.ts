import { IPointerListener } from "artistic-engine/event/event_groups";
import { ResolutionVector2D } from "../../helper/engine/resolution-vector2D";
import { TempSprite } from "../temp-sprite";
import { JoinPrivatePrompt } from "../../prompt/join-prv";
import { CreatePrivatePrompt } from "../../prompt/crt-prv";
import { onClick } from "../../helper/engine/pointer-processor";
import { MainScene } from "../../scenes/main";
import { Vector } from "artistic-engine";
import { ComputedVector2D } from "../../helper/engine/computed-vector2D";


export class MainButton extends TempSprite implements IPointerListener {
    public get PointerRegistered(): boolean {
        return MainScene.INSTANCE.MenuState === this.assignedState;
    }

    public RecieveEventsOutOfBound: boolean = false;

    private assignedState: number = 0;

    constructor(color: string, name: string, idx: number, menuState: number) {
        super(color, name);
        this.assignedState = menuState;
        const 
            LEFT_PAD = 20,
            INNER_GAP = 30,
            BOTTOM_PAD = 20,
            WIDTH = 210,
            HEIGHT = 80;
        this.Dimension = new Vector.Vector2D(
            WIDTH,
            HEIGHT
        );
        this.Position = new ComputedVector2D(
            LEFT_PAD + idx * (WIDTH + INNER_GAP),
            () => ResolutionVector2D.baseVector.Y - BOTTOM_PAD - HEIGHT
        );

        this.onPointer = onClick(() => {
            switch(idx) {
                case 0:
                    break;
                case 1:
                    this.Parent!.attachChildren(new JoinPrivatePrompt());
                    break;
                case 2:
                    this.Parent!.attachChildren(new CreatePrivatePrompt());
                    break;
            }
        }, () => true);
    }

    public onPointer(e: PointerEvent): boolean { return false; }
}
