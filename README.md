# realtime-game-client-demo

## Goal

- creating connection between [real-time-game-server-demo](https://github.com/artistXenon/realtime-game-server-demo) to communicate through UDP and TCP channel to exchange game data.
- creating connection between [real-time-match-server-demo](https://github.com/artistXenon/realtime-game-match-server-demo) to communicate through http to exchange user authentication, match-making data.
- creating reliable IPC connection between renderer and main for electron to safely share same information with least time lag between processes.

## Build

1. Clone the repository.

> git clone https://github.com/artistXenon/realtime-game-client-demo.git game-client
cd game-client
> 
1. Install dependencies

> npm i
> 
1. Configure match server address in [electron/google/index.ts](https://github.com/artistXenon/realtime-game-client-demo/blob/main/electron/google/index.ts). match server will provide game server address automatically after google OAuth2.0 login
2. Run 

> npm run dev
>
