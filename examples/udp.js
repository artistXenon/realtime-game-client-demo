const dgram = require('dgram');

const socket = dgram.createSocket('udp4');

let counter = 0;


socket.on("listening", () => { 
    // socket is made
});

socket.on("connect", () => { 
    // socket is connected
    setInterval(_ => {
        const msg = Buffer.from('join!' + JSON.stringify({ Id: 5230, GameId: 5430, Name: "Ailre" }));
        // console.log("buffer size: " + msg.length);
        socket.send(msg);
    }, 2000);

});

socket.on("message", (msg, info) => {
    console.log(msg.toString());
});


socket.on("error", (err) => {
    console.log(err)
});

socket.on("close", () => {
    // on socket terminate
});

socket.connect(5001, '127.0.0.1')
