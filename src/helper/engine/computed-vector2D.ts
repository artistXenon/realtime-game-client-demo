import { Vector } from "artistic-engine";

export class ComputedVector2D extends Vector.Vector2D {
    
    constructor(x: number | (() => number) = 0, y: number | (() => number) = 0) {
        const numberX = typeof x === "number";
        const numberY = typeof y === "number";
        super(numberX ? x : 0, numberY ? y : 0);
        if (!numberX) this.getX = x;
        if (!numberY) this.getY = y;
    }
    public getX: (() => number) | undefined;
    
    public getY: (() => number) | undefined;

    public override get X() {
        if (this.getX !== undefined) return this.getX();
        return this.values[0];
    }
    
    public override get Y() {
        if (this.getY !== undefined) return this.getY();
        return this.values[1];
    }
}
