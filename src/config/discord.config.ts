import { registerAs } from '@nestjs/config';

export default registerAs('discord', () => ({
  token: process.env.DISCORD_BOT_TOKEN,
  developmentGuildId: process.env.DISCORD_DEVELOPMENT_GUILD_ID,
}));
