const steamworks = require('steamworks.js');

// You can pass an appId, or don't pass anything and use a steam_appid.txt file
const client = steamworks.init(480);
const key = "";
const identity = "";

// Print Steam username
client.auth.getSessionTicket().then(ticket => ticket.getBytes().toString(16))
.then(t => 
    axios.get("https://partner.steam-api.com/ISteamUserAuth/AuthenticateUserTicket/v1/?key=" + key + "&appid=480&ticket=" + t + "&identity=" + identity)
).then(r => console.log(r.data)).catch(console.log);


