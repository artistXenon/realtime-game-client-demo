import './assets/style.css';

import { IpcRendererEvent } from 'electron';
import { Engine } from 'artistic-engine';
import { StartScene } from './scenes/start';
import { Sprite } from 'artistic-engine/sprite';
import { EngineAssets } from './assets/engine-assets';
import { ResolutionVector2D } from './helper/engine/resolution-vector2D';


const rootDiv = document.querySelector<HTMLDivElement>('#app')!;
rootDiv.innerHTML = `<canvas></canvas>`;
const canvas = document.querySelector<HTMLCanvasElement>('canvas')!;

const engine = new Engine(canvas);

const scene = new StartScene();
engine.Scene = scene;

addEventListener("resize", onResize);
onResize();

engine.start();

const assets = new EngineAssets(engine.AssetLoader);

assets.onLoad = () => {
  setTimeout(() => scene.showAilre(engine), 1000);
  
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

setTimeout(() => {
  // invoke communication loop
  // ipcInterface.showTime(0)
  ipcInterface.joinMatch(false); // join public match
}, 2000);

//

function onResize() {  
  engine.resizeCanvas();
  ResolutionVector2D.baseVector.X = engine.Canvas.width;
  ResolutionVector2D.baseVector.Y = engine.Canvas.height;
  if (engine.Scene instanceof Sprite) {
    engine.Scene.Width = engine.Canvas.width;
    engine.Scene.Height = engine.Canvas.height;
  }
}