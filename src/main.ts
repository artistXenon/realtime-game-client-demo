import './assets/style.css'


const rootDiv = document.querySelector<HTMLDivElement>('#app')!
rootDiv.innerHTML = `<h1></h1>`

const h1 = document.querySelector<HTMLDivElement>('h1')!

h1.innerText = "boo!"



postMessage({ payload: 'removeLoading' }, '*')
