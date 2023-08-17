export function onClick(action: () => unknown, capture: (e: PointerEvent) => boolean = () => false) {
    let pointerId = -1, pointerTime = -1;
    return (e: PointerEvent) => {
        if (e.type === "pointerdown") {            
            pointerId = e.pointerId;
            pointerTime = Date.now();
        } else if (e.type === "pointerup") {
            if (e.pointerId === pointerId && Date.now() - pointerTime < 1000) {
                action();
            }
        }        
        return capture(e);
    };
}
