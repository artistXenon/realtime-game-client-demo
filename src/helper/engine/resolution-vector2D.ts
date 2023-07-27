import { Vector } from "artistic-engine";

export class ResolutionVector2D extends Vector.Vector2D {
    public static baseVector: Vector.Vector2D = new Vector.Vector2D();

    constructor(x: number = 0, y: number = 0) {
        super();
    }
    
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

    public get normalX() {
        return ResolutionVector2D.normalizeX(this.X);
    }
    
    public get normalY() {
        return ResolutionVector2D.normalizeY(this.Y);
    }

    public set normalX(x: number) {
        this.X = ResolutionVector2D.reconX(x);
    }
    
    public set normalY(y: number) {
        this.Y = ResolutionVector2D.reconY(y);
    }
}
