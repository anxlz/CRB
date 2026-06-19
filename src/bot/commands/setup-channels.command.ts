import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext, Options, ChannelOption } from 'necord';
import { Channel } from 'discord.js';
import { BotService } from '../bot.service';
import { EMBED_COLOR, ROLE_COMBINATIONS } from '../../constants/game-data';

const BANNER_URL =
  'https://media.discordapp.net/attachments/1413190110694084789/1430281339231277066/bwDlFcd.png?ex=68f9dd8c&is=68f88c0c&hm=07f8d5ab727cce9b9122a8a17ecbc9dd53425a229cb9f666ad05dd112221194d&=&format=png&quality=lossless&width=400&height=63';

class SetupChannelDto {
  @ChannelOption({ name: 'channel1', description: 'First channel to add for setup messages', required: true })
  channel1: Channel;
  @ChannelOption({ name: 'channel2', description: 'Second channel (optional)', required: false })
  channel2?: Channel;
  @ChannelOption({ name: 'channel3', description: 'Third channel (optional)', required: false })
  channel3?: Channel;
  @ChannelOption({ name: 'channel4', description: 'Fourth channel (optional)', required: false })
  channel4?: Channel;
  @ChannelOption({ name: 'channel5', description: 'Fifth channel (optional)', required: false })
  channel5?: Channel;
}

@Injectable()
export class SetupChannelsCommand {
  constructor(private readonly botService: BotService) {}

  @SlashCommand({
    name: 'setupchannels',
    description: 'Set channels where roster setup messages will be sent',
  })
  async onSetupChannels(
    @Context() [interaction]: SlashCommandContext,
    @Options() { channel1, channel2, channel3, channel4, channel5 }: SetupChannelDto,
  ) {
    const guildId = interaction.guildId;
    if (!guildId) {
      return interaction.reply({ content: 'This command can only be used in a server!', ephemeral: true });
    }

    const channels = [channel1, channel2, channel3, channel4, channel5].filter(
      (ch): ch is Channel => ch !== undefined && ch !== null,
    );

    const addedChannels: string[] = [];
    for (const channel of channels) {
      this.botService.addSetupChannel(guildId, channel.id);
      addedChannels.push(`${channel}`);
    }

    const embed = {
      color: EMBED_COLOR,
      title: '**Setup Channels Configured**',
      description: `**The following channels have been added as roster setup channels:**\n${addedChannels.join('\n')}`,
      image: { url: BANNER_URL },
    };

    await interaction.reply({ embeds: [embed], ephemeral: true });

    const setupChannelEmbed = (channelId: string) => {
      const existingSetup = this.botService.getSetup(guildId!, channelId);
      const queueTime = existingSetup?.lastQueueTime
        ? existingSetup.lastQueueTime.toLocaleString()
        : new Date().toLocaleString();

      return {
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
    };

    const components = [
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: 'select_role_combination',
            placeholder: 'Select Role Combination',
            options: ROLE_COMBINATIONS.map((combo) => ({ label: combo, value: combo })),
          },
        ],
      },
      {
        type: 1,
        components: [
          { type: 2, style: 4, label: 'Leave', custom_id: 'leave_setup' },
          { type: 2, style: 2, label: 'Edit', custom_id: 'edit_roles' },
        ],
      },
      {
        type: 1,
        components: [{ type: 2, style: 3, label: '💡', custom_id: 'show_setup_steps' }],
      },
    ];

    for (const channel of channels) {
      if ('send' in channel && typeof channel.send === 'function') {
        const sentMessage = await channel.send({
          embeds: [setupChannelEmbed(channel.id)],
          components,
        });
        this.botService.setSetupMessageId(guildId, channel.id, sentMessage.id);
      }
    }
  }
}
