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
        'Click the **Join** button below to start setting up your team roster!\n\n' +
        '**Setup Flow:**\n' +
        '1. Select Weapon Class Roles (2 per player)\n' +
        '2. Choose Weapons\n' +
        '3. Pick Operator Skills\n' +
        '4. Select Lethal & Tactical Equipment',
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

    await interaction.channel.send({
      embeds: [setupChannelEmbed],
      components,
    });
  }
}
