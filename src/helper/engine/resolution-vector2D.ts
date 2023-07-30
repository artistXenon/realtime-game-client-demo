import { Vector } from "artistic-engine";

export class ResolutionVector2D extends Vector.Vector2D {
    public static baseVector: Vector.Vector2D = new Vector.Vector2D();
    
    public static onUpdate(width: number, height: number) {
        this.baseVector.X = width;
        this.baseVector.Y = height;
    }

    public static normalizeX(x: number) {
        return x * 1920 / this.baseVector.X;
    }
    
    public static normalizeY(y: number) {
        return y * 1080 / this.baseVector.Y;
    }

    public static reconX(x: number) {
        return x * this.baseVector.X / 1920;
    }

    public static reconY(y: number) {
        return y * this.baseVector.Y / 1080;
    }

    constructor(x: number = 0, y: number = 0) {
        super(x, y);
    }

    public override get X() {
        return ResolutionVector2D.reconX(this.values[0]);
    }
    
    public override get Y() {
        return ResolutionVector2D.reconY(this.values[1]);
    }

    public get normalX() {
        return this.values[0];
    }
    
    public get normalY() {
        return this.values[1];
    }
    
    public override set X(x: number) {
        this.values[0] = ResolutionVector2D.normalizeX(x);
    }
    
    public override set Y(y: number) {
        this.values[1] = ResolutionVector2D.normalizeY(y);
    }

    public set normalX(x: number) {
        this.values[0] = x;
    }
    
    public set normalY(y: number) {
        this.values[1] = y;
    }
}
