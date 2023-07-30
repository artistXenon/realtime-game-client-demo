import { Engine, FontBuilder } from "artistic-engine";
import { PointerEventGroup } from "artistic-engine/event";

export class Global {
    public static Engine: Engine;

    public static PointerEventGroup: PointerEventGroup;

    public static FontPoppin: FontBuilder;
    public static FontQuicksand: FontBuilder;

    private constructor() {}

    public static Exit(code: number = 0) {
        (<any>window).electronIPC.exit(code);
    }
}