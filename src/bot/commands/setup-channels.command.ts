import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext, Options, ChannelOption } from 'necord';
import { Channel, TextChannel } from 'discord.js';
import { BotService } from '../bot.service';
import { EMBED_COLOR } from '../../constants/game-data';

class SetupChannelDto {
  @ChannelOption({
    name: 'channel',
    description: 'Channel to add for setup messages',
    required: true,
  })
  channel: Channel;
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
    @Options() { channel }: SetupChannelDto,
  ) {
    const guildId = interaction.guildId;
    if (!guildId) {
      return interaction.reply({
        content: 'This command can only be used in a server!',
        ephemeral: true,
      });
    }

    this.botService.addSetupChannel(guildId, channel.id);

    const embed = {
      color: EMBED_COLOR,
      title: '✅ Setup Channel Configured',
      description: `${channel} has been added as a roster setup channel.`,
      timestamp: new Date().toISOString(),
    };

    await interaction.reply({ embeds: [embed], ephemeral: true });

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

    if ('send' in channel && typeof channel.send === 'function') {
      await channel.send({
        embeds: [setupChannelEmbed],
        components,
      });
    }
  }
}
