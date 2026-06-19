import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext } from 'necord';
import { BotService } from '../bot.service';
import { EMBED_COLOR, ROLE_COMBINATIONS } from '../../constants/game-data';

const BANNER_URL =
  'https://media.discordapp.net/attachments/1413190110694084789/1430281339231277066/bwDlFcd.png?ex=68f9dd8c&is=68f88c0c&hm=07f8d5ab727cce9b9122a8a17ecbc9dd53425a229cb9f666ad05dd112221194d&=&format=png&quality=lossless&width=400&height=63';

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
      return interaction.reply({ content: 'This command can only be used in a server!', ephemeral: true });
    }

    const setup = this.botService.getSetup(guildId, channelId);
    if (!setup) {
      return interaction.reply({ content: 'No active setup found in this channel.', ephemeral: true });
    }

    const queueTime = setup.lastQueueTime
      ? setup.lastQueueTime.toLocaleString()
      : new Date().toLocaleString();

    this.botService.resetSetup(guildId, channelId);

    const embed = {
      color: EMBED_COLOR,
      title: '**Setup Reset**',
      description: '**The roster setup has been reset. You can start a new setup now.**',
      image: { url: BANNER_URL },
    };

    await interaction.reply({ embeds: [embed] });

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

    await interaction.channel.send({ embeds: [setupChannelEmbed], components });
  }
}
