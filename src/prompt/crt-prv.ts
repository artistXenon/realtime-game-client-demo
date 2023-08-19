import { Prompt } from "./prompt";
import { ResolutionVector2D } from "../helper/engine/resolution-vector2D";
import { Rectangle, TextSprite } from "artistic-engine/sprite";
import { Global } from "../helper/global";
import { getTextWidth } from "../helper/text";
import { ComputedVector2D } from "../helper/engine/computed-vector2D";
import { TempPointerSprite } from "../sprites/temp-pointer-sprite";
import { onClick } from "../helper/engine/pointer-processor";
import { Lobby } from "../game/lobby";

export class CreatePrivatePrompt extends Prompt {
    public RecieveEventsOutOfBound: boolean = true;

    private createButton: TempPointerSprite;
    private exitButton: TempPointerSprite;
    private errText: TextSprite;

    constructor() {
        super(new Rectangle());
        (<Rectangle>this.window).FillStyle = "#666";
        this.window.Width = 600;       
        this.window.Height = 240;       
        this.window.Position = new ComputedVector2D(
            () => ResolutionVector2D.reconX(960) - this.window.Width / 2,
            () => ResolutionVector2D.reconY(540) - this.window.Height / 2,
        );       

        const title = new TextSprite();
        
        Global.FontVanilla.setSize("40px");
        title.Property.font = Global.FontVanilla.toString();
        title.Property.fill = "black";
        title.Text = () => Global.getString("create_private_lobby");
        const tm = getTextWidth(title.Text, title.Property.font);
        title.X = (this.window.W - tm.width) / 2;
        title.Y = 30;
        this.window.attachChildren(title);

        this.errText = new TextSprite({ Y: title.Y + 60 });
        Global.FontVanilla.setSize("20px");
        this.errText.Property.font = Global.FontVanilla.toString();

        this.createButton = new TempPointerSprite("skyblue", "", onClick(() => {
            /* TODO: do create */
            this.showLoading();
            Global.JoinLobby(true, undefined, (_, success, detail: any) => {
                if (!success) this.showError(detail.err);
                else {
                    Lobby.createNew(detail.id);
                    this.onDestroy();
                    window.navigator.clipboard.writeText(detail.id);
                }
            });           
        }, () => true));
        this.createButton.RecieveEventsOutOfBound = false;
        this.createButton.W = 150;
        this.createButton.H = 75;
        this.createButton.X = this.window.W / 2 - this.createButton.W - 20;
        this.createButton.Y = this.window.H - this.createButton.H - 20;

        this.window.attachChildren(this.createButton);
        
        this.exitButton = new TempPointerSprite("pink", "", onClick(() => this.onDestroy(), () => true));
        this.exitButton.RecieveEventsOutOfBound = false;
        this.exitButton.W = 150;
        this.exitButton.H = 75;
        this.exitButton.X = this.window.W / 2 + 20;
        this.exitButton.Y = this.window.H - this.exitButton.H - 20;

        this.window.attachChildren(this.exitButton);

        Global.PointerEventGroup.registerPointerListener(this);
        Global.PointerEventGroup.registerPointerListener(this.createButton);
        Global.PointerEventGroup.registerPointerListener(this.exitButton);
        // Global.PointerEventGroup.registerPointerListener();
    }

    public showLoading() {
        this.errText
        this.errText.Property.fill = "black";
        this.errText.Text = Global.getString("loading");
        const tm = getTextWidth(this.errText.Text, this.errText.Property.font);
        this.errText.X = (this.window.W - tm.width) / 2;
        if (this.errText.Parent !== this.window) {
            this.window.attachChildren(this.errText);
        }
    }

    public showError(err: string) {
        this.errText
        this.errText.Property.fill = "red";
        this.errText.Text = err;
        const tm = getTextWidth(this.errText.Text, this.errText.Property.font);
        this.errText.X = (this.window.W - tm.width) / 2;
        if (this.errText.Parent !== this.window) {
            this.window.attachChildren(this.errText);
        }
    }

    public onDestroy(): void {
        // remove from parent, remove pointer
        this.Parent?.detachChildren(this);
        Global.PointerEventGroup.unregisterPointerListener(this);
        Global.PointerEventGroup.unregisterPointerListener(this.createButton);
        Global.PointerEventGroup.unregisterPointerListener(this.exitButton);

        // WARN: dont forget to add additional elemtents
    }
}
