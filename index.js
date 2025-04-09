import dotenv from 'dotenv';
import insta from './insta.js';
import dc from "./discord.js"

dotenv.config();

dc.client.on("ready", async() => {
  dc.send("✅ Connected to discord")
});

dc.client.login(process.env.BOTTOKEN)
insta.login().then(async () => {
  insta.read()
})

// (async () => {

//   let polling = false

//   setInterval(async() => {
    
//     if(polling) return;
//     polling = true
//     console.log("polling...")

//     await read()
//     polling = false
//   }, 5000)
// })();