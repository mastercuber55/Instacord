import djs from "discord.js"
import FormData from 'form-data';
import fs from 'fs';

export const client = new djs.Client({ intents: [djs.GatewayIntentBits.Guilds] });

export async function send(
    message = "Empty Message", 
    username = "Instacord", 
    avatar = "https://cdn.discordapp.com/avatars/1359383345238118420/9d8c82823de2a005711a151d24306236.png",
    file = null
  ) {

    const form = new FormData();
    if(file) {
      form.append('file', fs.createReadStream("reels/audio.mp4"));
    }
    form.append('payload_json', JSON.stringify({
      content: message,
      username: username,
      avatar_url: avatar
    }));
    
    await fetch(process.env.WEBHOOK, {
      method: 'POST',
      body: form
    });
}

export default { client, send }