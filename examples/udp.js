const dgram = require('dgram');

const socket = dgram.createSocket('udp4');

let counter = 0;


function generateMsg(event, id, hash, body) {
    const b = Buffer.from(`${event}!${id}!${hash}!\n${body}`);
    if (b.length > 1024) {
        console.log("exceed!!!");
        return null;
    }
    return b;
}


socket.on("listening", () => { 
    // socket is made
});

socket.on("connect", () => { 
    // socket is connected
    let sb = generateMsg("join", 5230, "", JSON.stringify({ LobbyId: "1q2w3e", Name: "Ailre" }))
    socket.send(sb);
});

socket.on("message", (msg, info) => {
    const m = msg.toString()
    if (m === "ok") {
        setInterval(_ => {
            counter = Date.now();
            let sb = generateMsg("ping", 5230, "", counter);
            socket.send(sb);
        }, 2000)
        return
    }
    let r = m.split("!")
    if (r[0] === 'ping') {
        const now = Date.now();
        const ping = now - counter;
        const sendDelay = r[1] - now; // offset - half_ping
        const receiveDelay = Number(r[2]); // offset + half_ping
        const offset = (sendDelay + receiveDelay) / 2;
        console.log("ping:", ping, "server-client time offset:", offset);
        let sb = generateMsg("pong", 5230, "", JSON.stringify({ Ping: ping, Offset: offset, SendDelay: sendDelay }));
        socket.send(sb);
        return
    }

});


socket.on("error", (err) => {
    console.log(err)
});

socket.on("close", () => {
    // on socket terminate
});

socket.connect(5001, '127.0.0.1')
