import { Injectable } from '@nestjs/common';
import { Context, On, Once } from 'necord';
import { Client } from 'discord.js';
import { BotService } from './bot.service';
import { EMBED_COLOR } from '../constants/game-data';

@Injectable()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Once('clientReady')
  public async onReady(@Context() [client]: [Client]) {
    console.log(`Bot logged in as ${client.user?.tag}`);
    
    this.botService.setClient(client);
    
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
          const existingSetup = this.botService.getSetup(guild.id, channelId);
          const queueTime = existingSetup?.lastQueueTime 
            ? existingSetup.lastQueueTime.toLocaleString() 
            : new Date().toLocaleString();
          
          const setupChannelEmbed = {
            color: EMBED_COLOR,
            title: 'Roster Setup',
            description:
              'This is the start of the Queue channel.\n\n' +
              'War Machine/Gravity Spikes 0/2\n' +
              'Equalizer/Purifier 0/2\n' +
              'Death Machine/Gravity Vortex 0/2\n' +
              'Sparrow/Claw 0/2\n' +
              'Annihilator/Tempest 0/2\n\n' +
              `Last Queue: ${queueTime}`,
            footer: { text: 'COD Mobile Roster' },
          };

          const components = [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 1,
                  label: 'Join',
                  custom_id: 'join_setup',
                },
                {
                  type: 2,
                  style: 4,
                  label: 'Leave',
                  custom_id: 'leave_setup',
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
