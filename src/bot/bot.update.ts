import { Injectable } from '@nestjs/common';
import { Context, On, Once } from 'necord';
import { Client } from 'discord.js';
import { BotService } from './bot.service';
import { EMBED_COLOR, ROLE_COMBINATIONS } from '../constants/game-data';

@Injectable()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Once('clientReady')
  public async onReady(@Context() [client]: [Client]) {
    console.log(`Bot logged in as ${client.user?.tag}`);
    
    // Set bot status to streaming
    client.user?.setPresence({
      activities: [{
        name: 'COD Mobile Roster',
        type: 1, // 1 = Streaming
        url: 'https://twitch.tv/codmobile'
      }],
      status: 'online'
    });
    
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
            title: 'COD Mobile Roster Setup',
            description:
              '**Gun Roles:**\n' +
              '**AR** 0/3\n' +
              '**SMG** 0/3\n' +
              '**Marksman** 0/2\n' +
              '**Heavy** 0/2\n\n' +
              `Last Queue Date: ${queueTime}`,
            footer: { text: '5 Players Required' },
          };

          const components = [
            {
              type: 1,
              components: [
                {
                  type: 3,
                  custom_id: 'select_role_combination',
                  placeholder: 'Select Role Combination',
                  options: ROLE_COMBINATIONS.map((combo) => ({
                    label: combo,
                    value: combo,
                  })),
                },
              ],
            },
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 4,
                  label: 'Leave',
                  custom_id: 'leave_setup',
                },
                {
                  type: 2,
                  style: 2,
                  label: 'Edit',
                  custom_id: 'edit_roles',
                },
              ],
            },
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 3,
                  label: '💡',
                  custom_id: 'show_setup_steps',
                },
              ],
            },
          ];

          const messageId = this.botService.getSetupMessageId(guild.id, channelId);
          
          if (messageId) {
            try {
              const existingMessage = await channel.messages.fetch(messageId).catch(() => null);
              
              if (existingMessage) {
                await existingMessage.edit({
                  embeds: [setupChannelEmbed],
                  components,
                });
                count++;
                continue;
              }
            } catch (error) {
              console.log(`Failed to edit message ${messageId}, sending new one`);
            }
          }

          const sentMessage = await channel.send({
            embeds: [setupChannelEmbed],
            components,
          });
          
          this.botService.setSetupMessageId(guild.id, channelId, sentMessage.id);
          count++;
        }
      }
    }
    
    return count;
  }
}
