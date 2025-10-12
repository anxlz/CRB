import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext, Options, ChannelOption } from 'necord';
import { Channel } from 'discord.js';
import { BotService } from '../bot.service';
import { EMBED_COLOR } from '../../constants/game-data';

class SendSetupDto {
  @ChannelOption({
    name: 'channel',
    description: 'Channel to send setup message to',
    required: true,
  })
  channel: Channel;
}

@Injectable()
export class SendSetupCommand {
  constructor(private readonly botService: BotService) {}

  @SlashCommand({
    name: 'sendsetup',
    description: 'Manually send a setup message to a specified channel',
  })
  async onSendSetup(
    @Context() [interaction]: SlashCommandContext,
    @Options() { channel }: SendSetupDto,
  ) {
    const guildId = interaction.guildId;
    if (!guildId) {
      return interaction.reply({
        content: 'This command can only be used in a server!',
        ephemeral: true,
      });
    }

    const existingSetup = this.botService.getSetup(guildId, channel.id);
    const queueTime = existingSetup?.lastQueueTime 
      ? existingSetup.lastQueueTime.toLocaleString() 
      : new Date().toLocaleString();

    const setupChannelEmbed = {
      color: EMBED_COLOR,
      title: 'COD Mobile Roster Setup',
      description:
        'Click the **Join** button below to start setting up your team roster!\n\n' +
        '**Setup Flow:**\n' +
        '1. Select Weapon Class Roles (2 per player)\n' +
        '2. Choose Weapons (2 per player)\n' +
        '3. Pick Operator Skills\n' +
        '4. Select Lethal & Tactical Equipment\n\n' +
        `Last Queue: ${queueTime}`,
      footer: { text: '5 Players Required' },
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
          },
        ],
      },
    ];

    if ('send' in channel && typeof channel.send === 'function') {
      await channel.send({
        embeds: [setupChannelEmbed],
        components,
      });

      const embed = {
        color: EMBED_COLOR,
        title: 'Setup Message Sent',
        description: `Setup message has been sent to ${channel}`,
      };

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      return interaction.reply({
        content: 'The selected channel cannot receive messages!',
        ephemeral: true,
      });
    }
  }
}
