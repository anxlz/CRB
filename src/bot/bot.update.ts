import { Injectable } from '@nestjs/common';
import { Context, On, Once } from 'necord';
import { Client } from 'discord.js';
import { BotService } from './bot.service';
import { EMBED_COLOR } from '../constants/game-data';

@Injectable()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Once('ready')
  public async onReady(@Context() [client]: [Client]) {
    console.log(`Bot logged in as ${client.user?.tag}`);
    
    const setupChannels = await this.sendSetupMessages(client);
    console.log(`Sent setup messages to ${setupChannels} channels`);
  }

  private async sendSetupMessages(client: Client): Promise<number> {
    let count = 0;
    
    for (const guild of client.guilds.cache.values()) {
      const channels = this.botService.getSetupChannels(guild.id);
      
      for (const channelId of channels) {
        const channel = await guild.channels.fetch(channelId).catch(() => null);
        
        if (channel && channel.isTextBased()) {
          const setupChannelEmbed = {
            color: EMBED_COLOR,
            title: '🎮 COD Mobile Roster Setup',
            description:
              'Click the **Join** button below to start setting up your team roster!\n\n' +
              '**Setup Flow:**\n' +
              '1️⃣ Select Weapon Class Roles (2 per player)\n' +
              '2️⃣ Choose Weapons\n' +
              '3️⃣ Pick Operator Skills\n' +
              '4️⃣ Select Lethal & Tactical Equipment\n' +
              '5️⃣ Vote on Maps\n' +
              '6️⃣ Review Final Setup',
            footer: { text: '5 Players Required' },
            timestamp: new Date().toISOString(),
          };

          const components = [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 3,
                  label: 'Join',
                  custom_id: 'join_setup',
                  emoji: { name: '✅' },
                },
              ],
            },
          ];

          await channel.send({
            embeds: [setupChannelEmbed],
            components,
          });
          
          count++;
        }
      }
    }
    
    return count;
  }
}
