import './assets/style.css';

import { IpcRendererEvent } from 'electron';


const rootDiv = document.querySelector<HTMLDivElement>('#app')!;
rootDiv.innerHTML = `<h1></h1>`;

const h1 = document.querySelector<HTMLDivElement>('h1')!;

h1.innerText = "";

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