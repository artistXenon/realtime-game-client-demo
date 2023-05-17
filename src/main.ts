import { IpcRendererEvent } from 'electron';
import './assets/style.css'


const rootDiv = document.querySelector<HTMLDivElement>('#app')!
rootDiv.innerHTML = `<h1></h1>`

const h1 = document.querySelector<HTMLDivElement>('h1')!

h1.innerText = "";

// listen to node
(<any>window).DAO.showedTime((e: IpcRendererEvent, c: number) => {
    console.log(c + 1);
    setTimeout(() => {
        // send to node
        (<any>window).DAO.showTime(c + 1)
    }, 1000)
    
})

setTimeout(() => {
    // invoke communication loop
    (<any>window).DAO.showTime(0)
}, 1000)

postMessage({ payload: 'removeLoading' }, '*')
