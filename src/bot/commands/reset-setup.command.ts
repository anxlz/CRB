import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext } from 'necord';
import { BotService } from '../bot.service';
import { EMBED_COLOR } from '../../constants/game-data';

@Injectable()
export class ResetSetupCommand {
  constructor(private readonly botService: BotService) {}

  @SlashCommand({
    name: 'resetsetup',
    description: 'Reset the current roster setup in this channel',
  })
  async onResetSetup(@Context() [interaction]: SlashCommandContext) {
    const guildId = interaction.guildId;
    const channelId = interaction.channelId;

    if (!guildId) {
      return interaction.reply({
        content: 'This command can only be used in a server!',
        ephemeral: true,
      });
    }

    const setup = this.botService.getSetup(guildId, channelId);
    if (!setup) {
      return interaction.reply({
        content: 'No active setup found in this channel.',
        ephemeral: true,
      });
    }

    const queueTime = setup.lastQueueTime 
      ? setup.lastQueueTime.toLocaleString() 
      : new Date().toLocaleString();

    this.botService.resetSetup(guildId, channelId);

    const embed = {
      color: EMBED_COLOR,
      title: 'Setup Reset',
      description: 'The roster setup has been reset. You can start a new setup now.',
    };

    await interaction.reply({ embeds: [embed] });
    
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

    await interaction.channel.send({
      embeds: [setupChannelEmbed],
      components,
    });
  }
}
