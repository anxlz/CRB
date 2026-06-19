import { Injectable } from '@nestjs/common';
import { Context, On, Once } from 'necord';
import { Client } from 'discord.js';
import { BotService } from './bot.service';
import { EMBED_COLOR, ROLE_COMBINATIONS } from '../constants/game-data';

const BANNER_URL =
  'https://media.discordapp.net/attachments/1413190110694084789/1430281339231277066/bwDlFcd.png?ex=68f9dd8c&is=68f88c0c&hm=07f8d5ab727cce9b9122a8a17ecbc9dd53425a229cb9f666ad05dd112221194d&=&format=png&quality=lossless&width=400&height=63';

@Injectable()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Once('clientReady')
  public async onReady(@Context() [client]: [Client]) {
    console.log(`Bot logged in as ${client.user?.tag}`);

    client.user?.setPresence({
      activities: [
        {
          name: 'COD Mobile Roster',
          type: 1, // Streaming
          url: 'https://twitch.tv/codmobile',
        },
      ],
      status: 'online',
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
            title: '**COD Mobile Roster Setup**',
            description:
              '**Gun Roles:**\n' +
              '**0/3 SMG**\n' +
              '**0/3 AR**\n' +
              '**0/1 Sniper**\n' +
              '**0/1 Shotgun**\n' +
              '**0/1 Marksman**\n' +
              '**0/1 LMG**\n\n' +
              `**Last Queue Date: ${queueTime}**`,
            footer: { text: '5 Players Required' },
            image: { url: BANNER_URL },
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
              const existingMessage = await channel.messages
                .fetch(messageId)
                .catch(() => null);
              if (existingMessage) {
                await existingMessage.edit({ embeds: [setupChannelEmbed], components });
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
