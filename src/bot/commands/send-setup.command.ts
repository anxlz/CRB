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
        '**Gun Roles:**\n' +
        '**AR** 0/3\n' +
        '**SMG** 0/3\n' +
        '**Marksman** 0/2\n' +
        '**Heavy** 0/2\n\n' +
        `Last Queue: ${queueTime}`,
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
