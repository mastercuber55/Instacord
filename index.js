import { IgApiClient } from 'instagram-private-api';
import dotenv from 'dotenv';
dotenv.config();

const ig = new IgApiClient();
ig.state.generateDevice(process.env.NAMEUSER);

(async () => {
  await ig.account.login(process.env.NAMEUSER, process.env.PASSWORD);

  const userId = await ig.user.getIdByUsername(process.env.OWNERNAME);
  await ig.entity.directThread([userId.toString()]).broadcastText('Hello from my erm!');
})();