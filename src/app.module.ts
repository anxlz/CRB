import { Module } from "@nestjs/common";
import { NecordModule } from "necord";
import { BotModule } from "./bot/bot.module";

@Module({
  imports: [
    NecordModule.forRoot({
      token: process.env.DISCORD_BOT_TOKEN || "",
      intents: ["Guilds", "GuildMessages", "MessageContent"],
      development: process.env.DISCORD_DEVELOPMENT_GUILD_ID
        ? [process.env.DISCORD_DEVELOPMENT_GUILD_ID]
        : undefined,
    }),
    BotModule,
  ],
})
export class AppModule {}
