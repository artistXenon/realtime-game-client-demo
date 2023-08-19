import { Prompt } from "./prompt";
import { ResolutionVector2D } from "../helper/engine/resolution-vector2D";
import { Rectangle } from "artistic-engine/sprite";
import { IPointerListener } from "artistic-engine/event";
import { Global } from "../helper/global";
import { OptionItem } from "../sprites/option/option-item";
import { Preferences } from "../helper/preference";

export class OptionPrompt extends Prompt implements IPointerListener {
    public RecieveEventsOutOfBound: boolean = true;

    private optionItems: OptionItem[];

    private exitButton: OptionItem;

    constructor() {
        super(new Rectangle());
        Global.PointerEventGroup.registerPointerListener(this);
        
        (<Rectangle>this.window).FillStyle = "#666";
        this.window.Position = new ResolutionVector2D(96, 54);
        this.window.Dimension = new ResolutionVector2D(1728, 972);       

        this.optionItems = [
            new OptionItem("save_login", () => {
                console.log("blop");
                Global.preferences.SaveLogin = !Global.preferences.SaveLogin
                return true;
            }),
            new OptionItem("option2"),
            new OptionItem("option3"),
            new OptionItem("option4"),
            new OptionItem("option5"),
            new OptionItem("option6"),
            new OptionItem("option7"),
            new OptionItem("option8")
        ];
        const dim = new ResolutionVector2D(819, 160);
        for (let i = 0; i < this.optionItems.length; i++) {
            const item = this.optionItems[i];
            item.Dimension = dim;
            item.Position = new ResolutionVector2D(
                i % 2 === 0 ? 30 : 879,
                30 + Math.floor(i / 2) * 190
            );      
            this.window.attachChildren(item);
            Global.PointerEventGroup.registerPointerListener(item);
        }

        this.exitButton = new OptionItem("exit", () => {
            this.onDestroy();
            return true;
        });
        this.exitButton.Dimension = dim;
        this.exitButton.Position = new ResolutionVector2D(
            455, 790
        );

        this.window.attachChildren(this.optionItems);
        this.window.attachChildren(this.exitButton);
        Global.PointerEventGroup.registerPointerListener(this.exitButton);
        // Global.PointerEventGroup.registerPointerListener();
    }

    public onDestroy(): void {
        // remove from parent, remove pointer
        this.Parent?.detachChildren(this);
        Global.PointerEventGroup.unregisterPointerListener(this);
        for (const item of this.optionItems) {
            Global.PointerEventGroup.unregisterPointerListener(item);
        }
        Global.PointerEventGroup.unregisterPointerListener(this.exitButton);

        // WARN: dont forget to add additional elements
        // TODO
    }
}
