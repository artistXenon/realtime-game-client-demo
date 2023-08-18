import { IPointerListener } from "artistic-engine/event";
import { Sprite, TextSprite } from "artistic-engine/sprite";
import { FontBuilder } from "artistic-engine";
import { Modifier } from "artistic-engine/modifiers";
import { ResolutionVector2D } from "../helper/engine/resolution-vector2D";
import { MainScene } from "./main";
import { Global } from "../helper/global";
import { ComputedVector2D } from "../helper/engine/computed-vector2D";
import { getTextWidth as getTextMetrix } from "../helper/text";

export class StartScene extends Sprite implements IPointerListener {

    public PointerRegistered: boolean = true;
    public RecieveEventsOutOfBound: boolean = true;
    
    private mainTextSprite: TextSprite = new TextSprite();
    private subTextSprite1: TextSprite = new TextSprite();
    private indicatorTextSprite: TextSprite = new TextSprite();
    // private noticeTextSprite: TextSprite = new TextSprite();

    private cacheTextMetrics: number = 0;
    private modifier: Modifier | undefined;
    private opacity: number = 0;

    private state: 0 | 1 | 2 | 3 = 0;

    constructor() {
        super();
        // TODO: modifiers will show logo of 
        // Ailre
        // pride - artistic
        // notice about unofficial derivative of hololive cover corp        
    }
    public onDraw(ctx: CanvasRenderingContext2D, delay: number): void {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.W, this.H);
        const white = this.white(), black = this.black();
        switch(this.state) {
            case 0:
                return;
            case 1:
                if (this.modifier !== undefined && this.modifier.Progress >= 1) {
                    this.showEngine();
                }

                this.mainTextSprite.Property.fill = white;
                this.indicatorTextSprite!.Property.fill = white;

                break;
            case 2: 
                let textMeasure2 = getTextMetrix(this.subTextSprite1.Text, this.subTextSprite1.Property.font);
                if (this.modifier !== undefined && this.modifier.Progress >= 1) {
                    // show hololive unofficial
                    setTimeout(() => this.skip(), 1000);                    
                }

                ctx.fillRect(0, 0, 0, 0);
                this.mainTextSprite.Property.fill = white;
                this.subTextSprite1.Property.fill = black;
                this.indicatorTextSprite.Property.fill = white;

                ctx.fillStyle = white;
                ctx.fillRect(this.subTextSprite1.X, this.subTextSprite1.Y, this.cacheTextMetrics + 3, 73);

                break;
        }
    }

    public showAilre() {
        this.state = 1;
        this.indicatorTextSprite = new TextSprite();
        this.attachChildren([this.mainTextSprite, this.indicatorTextSprite]);

        Global.FontPoppin.setSize("100px").setWeight("500");
        this.mainTextSprite.Property.font = Global.FontPoppin.toString();
        this.mainTextSprite.Property.fill = "white";
        this.mainTextSprite.Text = "Ailre";

        const defFont = new FontBuilder();
        defFont.setSize("30px");
        this.indicatorTextSprite.Property.font = defFont.toString();
        this.indicatorTextSprite.Property.fill = "white";
        this.indicatorTextSprite.Text = "developed by";

        const textMeasure = getTextMetrix(this.mainTextSprite.Text, this.mainTextSprite.Property.font);

        const 
            computedVector1 = new ComputedVector2D(
                () => ResolutionVector2D.reconX(960) - textMeasure.width / 2,
                () => ResolutionVector2D.reconY(540) - 50
            ),
            computedVector2 = new ComputedVector2D(
                () => computedVector1.X,
                () => computedVector1.Y - 35
            );

        this.mainTextSprite.Position = computedVector1;
        this.indicatorTextSprite.Position = computedVector2;

        this.modifier = new Modifier(0, 1, 3000, (v) => {
            this.opacity = this.modify(v);
        });
        Global.Engine.registerModifier(this.modifier);
    }

    private showEngine() {
        this.attachChildren(this.subTextSprite1);
        this.state = 2;
        Global.FontPoppin.setSize("80px");
        this.mainTextSprite.Property.font = Global.FontPoppin.toString();
        this.mainTextSprite.Property.fill = "white";
        this.mainTextSprite.Text = "artistic";
        
        Global.FontQuicksand.setSize("80px").setWeight("300");
        this.subTextSprite1.Property.font = Global.FontQuicksand.toString();
        this.subTextSprite1.Property.fill = "black";
        this.subTextSprite1.Text = "ENGINE";
        
        this.indicatorTextSprite.Text = "developed with";

        const 
            textMeasure1 = getTextMetrix(this.mainTextSprite.Text, this.mainTextSprite.Property.font),
            textMeasure2 = getTextMetrix(this.subTextSprite1.Text, this.subTextSprite1.Property.font);

        const 
            computedVector1 = new ComputedVector2D(
                () => ResolutionVector2D.reconX(960) - (textMeasure1.width + textMeasure2.width) / 2,
                () => ResolutionVector2D.reconY(540) - 40
            ),
            computedVector2 = new ComputedVector2D(
                () => this.mainTextSprite.X + textMeasure1.width,
                () => this.mainTextSprite.Y
            ),          
            computedVector3 = new ComputedVector2D(
                () => this.mainTextSprite.X,
                () => this.mainTextSprite.Y - 35
            );
        
        this.cacheTextMetrics = textMeasure2.width;
        this.mainTextSprite.Position = computedVector1;
        this.subTextSprite1.Position = computedVector2;      
        this.indicatorTextSprite.Position = computedVector3;

        this.modifier = new Modifier(0, 1, 3000, (v) => {
            this.opacity = this.modify(v);
        });
        Global.Engine.registerModifier(this.modifier);
    }

    public onPointer(e: PointerEvent): boolean {
        if (e.type !== "pointerdown") return false;
        Global.PointerEventGroup.unregisterPointerListener(this);
        this.skip();
        return true;
    }


    private skip() {
        this.state = 3;
        // change scene to main
        Global.Engine.Scene = MainScene.INSTANCE
    }

    private black() {
        return `rgba(0, 0, 0, ${this.opacity})`;
    }
    
    private white() {
        return `rgba(255, 255, 255, ${this.opacity})`;
    }

    private modify(v: number) {
        const div = [.2, .8];
        if (v < div[0]) return v / div[0];
        if (v < div[1]) return 1;
        return (1 - v) / (1 - div[1]);        
    }
}
