import { Prompt } from "./prompt";
import { ResolutionVector2D } from "../helper/engine/resolution-vector2D";
import { Rectangle, TextSprite } from "artistic-engine/sprite";
import { Global } from "../helper/global";
import { getTextWidth } from "../helper/text";
import { ComputedVector2D } from "../helper/engine/computed-vector2D";
import { TempPointerSprite } from "../sprites/temp-pointer-sprite";
import { onClick } from "../helper/engine/pointer-processor";

export class ExitPrompt extends Prompt {

    // TODO:
    // NOT CONFIRMED. 
    // THIS IS A STRAIGHT COPY OF JOIN-PRIVATE
    // READ THROUGH WHOLE FILE BEFORE USE


    public RecieveEventsOutOfBound: boolean = true;

    private okButton: TempPointerSprite;
    private cancelButton: TempPointerSprite;
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

        const title = new TextSprite({ Y: 20 });        

        Global.FontVanilla.setSize("20px");
        title.Property.font = Global.FontVanilla.toString();
        title.Property.fill = "black";
        title.Text = () => Global.getString("exit_confirm");
        const tm = getTextWidth(title.Text, title.Property.font);
        title.X = (this.window.W - tm.width) / 2;
        this.window.attachChildren(title);

        this.errText = new TextSprite({ Y: title.Y + 60 });
        Global.FontVanilla.setSize("20px");
        this.errText.Property.font = Global.FontVanilla.toString();

        this.okButton = new TempPointerSprite("skyblue", "", onClick(async () => {
            // const code = await navigator.clipboard.readText();
            // const isCode = /^[a-zA-Z0-9]{5}$/.test(code);
            // if (!isCode) {
            //     return this.showError("Invalid code!");
            // }
            // this.showLoading();
            // Global.JoinMatch(true, code, (_, success, detail: any) => {
            //     if (!success) this.showError(detail.err);
            //     else {
            //         console.log(detail.id);
            //         Lobby.createNew(detail.id);
            //         this.onDestroy();
            //     }
            // });   

            // TODO: if joined in lobby, do a leave before exit.
            Global.Exit();     
        }, () => true));
        this.okButton.RecieveEventsOutOfBound = false;
        this.okButton.W = 150;
        this.okButton.H = 75;
        this.okButton.X = this.window.W / 2 - this.okButton.W - 20;
        this.okButton.Y = this.window.H - this.okButton.H - 20;

        this.window.attachChildren(this.okButton);
        
        this.cancelButton = new TempPointerSprite("pink", "", onClick(() => this.onDestroy(), () => true));
        this.cancelButton.RecieveEventsOutOfBound = false;
        this.cancelButton.W = 150;
        this.cancelButton.H = 75;
        this.cancelButton.X = this.window.W / 2 + 20;
        this.cancelButton.Y = this.window.H - this.cancelButton.H - 20;

        this.window.attachChildren(this.cancelButton);

        Global.PointerEventGroup.registerPointerListener(this);
        Global.PointerEventGroup.registerPointerListener(this.okButton);
        Global.PointerEventGroup.registerPointerListener(this.cancelButton);
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
        Global.PointerEventGroup.unregisterPointerListener(this.okButton);
        Global.PointerEventGroup.unregisterPointerListener(this.cancelButton);

        // WARN: dont forget to add additional elemtents
    }
}
