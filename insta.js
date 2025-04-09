import fs from 'fs';
import { IgApiClient } from 'instagram-private-api';
import dc from './discord.js';
import getReel from './reel.js';

const ig = new IgApiClient();
const messagesId = new Set();

export async function login() {
  ig.state.generateDevice(process.env.NAMEUSER);

  if (fs.existsSync('session.json')) {
    const session = JSON.parse(fs.readFileSync('session.json', 'utf8'));
    await ig.state.deserialize(session);
    dc.send("✅ Connected to Instagram using session.json")

    return;
  }

  await ig.simulate.preLoginFlow();
  await ig.account.login(process.env.NAMEUSER, process.env.PASSWORD);
  process.nextTick(async () => await ig.feed.timeline().request());

  const session = await ig.state.serialize();
  delete session.constants;
  fs.writeFileSync('session.json', JSON.stringify(session));
  dc.send('✅ Logged into Instagram and saved session.json');
}
async function read(threadId = "340282366841710301281161216272984277677") {

  const threadsFeed = ig.feed.directInbox();
  const threads = await threadsFeed.items();

  const targetThread = threads.find(
    t => t.thread_id == threadId
  );


  const threadFeed = ig.feed.directThread({ thread_id: threadId });
  const messages = await threadFeed.items();

  const botId = (await ig.account.currentUser()).pk;

  for (const msg of messages.slice().reverse()) {
    if (messagesId.has(msg.item_id)) continue;
    if (msg.user_id === botId) continue; 
    const sender = targetThread.users.find(u => u.pk === msg.user_id);

    let content;
    let file = null;

    if(msg.item_type == "text") {
      content = msg.text ||
      msg.action_log?.description && `*${msg.action_log.description}*` ||
      msg.media?.image_versions2?.candidates?.[0]?.url ||
      '[Unsupported message]';
    // } else if(msg.item_type == "clip") {
      // file = getReel(msg.clip.clip.video_dash_manifest)
    } else if(msg.item_type == "media_share") {
      console.log(message.media_share)
    } else {
      console.log(msg)
      content = msg.text ||
      msg.action_log?.description && `*${msg.action_log.description}*` ||
      msg.media?.image_versions2?.candidates?.[0]?.url ||
      '[Unsupported message]';
    }

    await dc.send(content, sender.full_name, sender?.profile_pic_url, file);

    messagesId.add(msg.message_id);
  }
}

async function find(threadName) {
  const threadsFeed = ig.feed.directInbox();
  const threads = await threadsFeed.items();

  const targetThread = threads.find(
    t => t.thread_title === threadName
  );

  return targetThread.thread_id
}

async function send(message, threadId = "340282366841710301281161216272984277677") {
  const thread = ig.entity.directThread(threadId);
  await thread.broadcastText(message);
}

export default {
  read, login, find, send
}