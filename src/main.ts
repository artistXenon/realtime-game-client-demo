import './assets/style.css';

import { IpcRendererEvent } from 'electron';


const rootDiv = document.querySelector<HTMLDivElement>('#app')!;
rootDiv.innerHTML = `<h1></h1>`;

const h1 = document.querySelector<HTMLDivElement>('h1')!;

h1.innerText = "";

// listen to node
(<any>window).electronIPC.showedTime((e: IpcRendererEvent, c: number) => {
  console.log(c + 1);
  setTimeout(() => (<any>window).electronIPC.showTime(c + 1), 500);
});

setTimeout(() => {
  // invoke communication loop
  (<any>window).electronIPC.showTime(0)
}, 1000);

