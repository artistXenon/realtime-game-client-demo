import { Sprite, TextSprite } from "artistic-engine/sprite";
import { Engine, FontBuilder, Vector } from "artistic-engine";
import { Modifier } from "artistic-engine/modifiers";
import { ResolutionVector2D } from "../helper/engine/resolution-vector2D";

export class StartScene extends Sprite {
    private poppinFont: FontBuilder;
    private quicksandFont: FontBuilder;
    
    private engine: Engine | undefined;

    private mainTextSprite: TextSprite = new TextSprite();
    private subTextSprite1: TextSprite = new TextSprite();
    private indicatorTextSprite: TextSprite = new TextSprite();
    private modifier: Modifier | undefined;
    private opacity: number = 0;

    private state: 0 | 1 | 2 | 3 = 0;

    constructor() {
        super();
        // TODO: modifiers will show logo of 
        // Ailre
        // pride - artistic
        // unofficial derivative of hololive cover corp
        this.poppinFont = new FontBuilder("Poppin");
        this.quicksandFont = new FontBuilder("Quicksand");
        
    }
    public onDraw(ctx: CanvasRenderingContext2D, delay: number): void {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.W, this.H);
        let tmpf, textMeasure;
        const white = this.white(), black = this.black();
        switch(this.state) {
            case 0:
                return;
            case 1:
                if (this.modifier !== undefined && this.modifier.Progress >= 1) {
                    this.showEngine();
                }
                tmpf = ctx.font;
                ctx.font = this.mainTextSprite.Property.font;
                textMeasure = ctx.measureText(this.mainTextSprite.Text);
                ctx.font = tmpf;

                this.mainTextSprite.Property.fill = white;
                this.indicatorTextSprite!.Property.fill = white;

                this.mainTextSprite.X = ResolutionVector2D.reconX(960) - textMeasure.width / 2;
                this.mainTextSprite.Y = ResolutionVector2D.reconY(540) - 50;

                this.indicatorTextSprite.X = this.mainTextSprite.X;
                this.indicatorTextSprite.Y = this.mainTextSprite.Y - 35;
                break;
            case 2: 
                tmpf = ctx.font;
                ctx.font = this.mainTextSprite.Property.font;
                let textMeasure1 = ctx.measureText(this.mainTextSprite.Text);
                ctx.font = this.subTextSprite1.Property.font;
                let textMeasure2 = ctx.measureText(this.subTextSprite1.Text);
                ctx.font = tmpf;
                if (this.modifier !== undefined && this.modifier.Progress >= 1) {
                    // show hololive unofficial
                    this.destroyScene();
                }

                ctx.fillRect(0, 0, 0, 0);
                this.mainTextSprite.Property.fill = white;
                this.subTextSprite1.Property.fill = black;
                this.indicatorTextSprite.Property.fill = white;

                this.mainTextSprite.X = ResolutionVector2D.reconX(960) - (textMeasure1.width + textMeasure2.width) / 2;
                this.mainTextSprite.Y = ResolutionVector2D.reconY(540) - 40;
                
                this.subTextSprite1.X = this.mainTextSprite.X + textMeasure1.width;
                this.subTextSprite1.Y = this.mainTextSprite.Y;

                ctx.fillStyle = white;
                ctx.fillRect(this.subTextSprite1.X, this.subTextSprite1.Y, textMeasure2.width + 3, 73);

                this.indicatorTextSprite.X = this.mainTextSprite.X;
                this.indicatorTextSprite.Y = this.mainTextSprite.Y - 35;   
                break;
        }
    }

    public showAilre(engine: Engine) {
        this.state = 1;
        this.indicatorTextSprite = new TextSprite();
        this.attachChildren([this.mainTextSprite, this.indicatorTextSprite]);

        this.poppinFont.setSize("100px").setWeight("500");
        this.mainTextSprite.Property.font = this.poppinFont.toString();
        this.mainTextSprite.Property.fill = "white";
        this.mainTextSprite.Text = "Ailre";
        
        const defFont = new FontBuilder();
        defFont.setSize("30px");
        this.indicatorTextSprite.Property.font = defFont.toString();
        this.indicatorTextSprite.Property.fill = "white";
        this.indicatorTextSprite.Text = "developed by";

        this.engine = engine;
        this.modifier = new Modifier(0, 1, 3000, (v) => {
            this.opacity = this.modify(v);
        });
        this.engine.registerModifier(this.modifier);
    }

    private showEngine() {
        this.attachChildren(this.subTextSprite1);
        this.state = 2;
        this.poppinFont.setSize("80px");
        this.mainTextSprite.Property.font = this.poppinFont.toString();
        this.mainTextSprite.Property.fill = "white";
        this.mainTextSprite.Text = "artistic";

        this.quicksandFont.setSize("80px").setWeight("300");
        this.subTextSprite1.Property.font = this.quicksandFont.toString();
        this.subTextSprite1.Property.fill = "black";
        this.subTextSprite1.Text = "ENGINE";
        
        this.indicatorTextSprite.Text = "developed with";

        this.modifier = new Modifier(0, 1, 3000, (v) => {
            this.opacity = this.modify(v);
        });
        this.engine!.registerModifier(this.modifier);
    }

    private destroyScene() {
        this.state = 3;
        // change scene to main
    }

    private skip() {
        // TODO: on click, skip intro logos. 
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
