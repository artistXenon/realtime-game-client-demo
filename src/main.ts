import './assets/style.css';

import { IpcRendererEvent } from 'electron';
import { Engine, FontBuilder } from 'artistic-engine';
import { StartScene } from './scenes/start';
import { Sprite } from 'artistic-engine/sprite';
import { EngineAssets } from './assets/engine-assets';
import { ResolutionVector2D } from './helper/engine/resolution-vector2D';
import { PointerEventGroup } from 'artistic-engine/event';
import { Global } from './helper/global';

const canvas = document.querySelector<HTMLCanvasElement>('canvas')!;

Global.Engine = new Engine(canvas);

const scene = new StartScene();
Global.Engine.Scene = scene;

addEventListener("resize", onResize);
onResize();

Global.Engine.start();

const assets = new EngineAssets(Global.Engine.AssetLoader);

Global.PointerEventGroup = new PointerEventGroup(Global.Engine);
Global.PointerEventGroup.registerPointerListener(scene);
Global.PointerEventGroup.registerEvent();
Global.PointerEventGroup.setListenSequenceFirstInFirstTrigger(false);

assets.onLoad = () => {
    Global.FontPoppin = new FontBuilder("Poppin");
    Global.FontQuicksand = new FontBuilder("Quicksand");
    Global.FontVanilla = new FontBuilder("Vanilla");
    setTimeout(() => scene.showAilre(), 1000);
};





// IPC

const ipcInterface = (<any>window).electronIPC;

// listen to node
ipcInterface.showedTime((e: IpcRendererEvent, c: number) => {
    console.log(c + 1);
    setTimeout(() => ipcInterface.showTime(c + 1), 500);
});


ipcInterface.onError((e: IpcRendererEvent, err: string) => {
    console.log(err);
});

// setTimeout(() => {
//   // invoke communication loop
//   // ipcInterface.showTime(0)
//   ipcInterface.joinMatch(false); // join public match
// }, 2000);

//

function onResize() {  
    const engine = Global.Engine;
    engine.resizeCanvas();
    ResolutionVector2D.baseVector.X = engine.Canvas.width;
    ResolutionVector2D.baseVector.Y = engine.Canvas.height;
    if (engine.Scene instanceof Sprite) {
        engine.Scene.Width = engine.Canvas.width;
        engine.Scene.Height = engine.Canvas.height;
    }
}
