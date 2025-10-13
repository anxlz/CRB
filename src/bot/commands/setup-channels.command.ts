import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext, Options, ChannelOption } from 'necord';
import { Channel, TextChannel } from 'discord.js';
import { BotService } from '../bot.service';
import { EMBED_COLOR } from '../../constants/game-data';

class SetupChannelDto {
  @ChannelOption({
    name: 'channel1',
    description: 'First channel to add for setup messages',
    required: true,
  })
  channel1: Channel;

  @ChannelOption({
    name: 'channel2',
    description: 'Second channel (optional)',
    required: false,
  })
  channel2?: Channel;

  @ChannelOption({
    name: 'channel3',
    description: 'Third channel (optional)',
    required: false,
  })
  channel3?: Channel;

  @ChannelOption({
    name: 'channel4',
    description: 'Fourth channel (optional)',
    required: false,
  })
  channel4?: Channel;

  @ChannelOption({
    name: 'channel5',
    description: 'Fifth channel (optional)',
    required: false,
  })
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
      return interaction.reply({
        content: 'This command can only be used in a server!',
        ephemeral: true,
      });
    }

    const channels = [channel1, channel2, channel3, channel4, channel5].filter(
      (ch): ch is Channel => ch !== undefined && ch !== null
    );

    const addedChannels: string[] = [];

    for (const channel of channels) {
      this.botService.addSetupChannel(guildId, channel.id);
      addedChannels.push(`${channel}`);
    }

    const embed = {
      color: EMBED_COLOR,
      title: 'Setup Channels Configured',
      description: `The following channels have been added as roster setup channels:\n${addedChannels.join('\n')}`,
    };

    await interaction.reply({ embeds: [embed], ephemeral: true });

    const setupChannelEmbed = (channelId: string) => {
      const existingSetup = this.botService.getSetup(guildId!, channelId);
      const queueTime = existingSetup?.lastQueueTime 
        ? existingSetup.lastQueueTime.toLocaleString() 
        : new Date().toLocaleString();
      
      return {
        color: EMBED_COLOR,
        title: 'COD Mobile Roster Setup',
        description:
          '**Gun Roles:**\n' +
          '**AR** 0/3\n' +
          '**SMG** 0/3\n' +
          '**Marksman** 0/2\n' +
          '**Heavy** 0/2\n\n' +
          `Last Queue: ${queueTime}`,
        footer: { text: '5 Players Required' },
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
            options: [
              { label: 'AR/SMG', value: 'AR/SMG' },
              { label: 'AR/Marksman', value: 'AR/Marksman' },
              { label: 'AR/Heavy', value: 'AR/Heavy' },
              { label: 'SMG/AR', value: 'SMG/AR' },
              { label: 'SMG/Marksman', value: 'SMG/Marksman' },
              { label: 'SMG/Heavy', value: 'SMG/Heavy' },
              { label: 'Marksman/AR', value: 'Marksman/AR' },
              { label: 'Marksman/SMG', value: 'Marksman/SMG' },
              { label: 'Marksman/Heavy', value: 'Marksman/Heavy' },
              { label: 'Heavy/SMG', value: 'Heavy/SMG' },
              { label: 'Heavy/AR', value: 'Heavy/AR' },
              { label: 'Heavy/Marksman', value: 'Heavy/Marksman' },
            ],
          },
        ],
      },
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

    for (const channel of channels) {
      if ('send' in channel && typeof channel.send === 'function') {
        await channel.send({
          embeds: [setupChannelEmbed(channel.id)],
          components,
        });
      }
    }
  }
}
