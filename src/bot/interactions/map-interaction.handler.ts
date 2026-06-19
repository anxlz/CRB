import { Injectable } from '@nestjs/common';
import { Context, Button, ButtonContext } from 'necord';
import { BotService } from '../bot.service';
import { EMBED_COLOR, ROLE_COMBINATIONS } from '../../constants/game-data';

const BANNER_URL =
  'https://media.discordapp.net/attachments/1413190110694084789/1430281339231277066/bwDlFcd.png?ex=68f9dd8c&is=68f88c0c&hm=07f8d5ab727cce9b9122a8a17ecbc9dd53425a229cb9f666ad05dd112221194d&=&format=png&quality=lossless&width=400&height=63';

@Injectable()
export class MapInteractionHandler {
  constructor(private readonly botService: BotService) {}

  @Button('new_setup')
  public async onNewSetup(@Context() [interaction]: ButtonContext) {
    const guildId = interaction.guildId!;
    const channelId = interaction.channelId;

    const managerRoleId = this.botService.getManagerRole(guildId);
    if (managerRoleId) {
      const memberRoles = interaction.member?.roles;
      const hasRole = Array.isArray(memberRoles)
        ? memberRoles.includes(managerRoleId)
        : memberRoles?.cache?.has(managerRoleId);

      if (!hasRole) {
        return interaction.reply({
          content:
            'You do not have permission to start a new setup. Only users with the manager role can do this.',
          ephemeral: true,
        });
      }
    }

    const existingSetup = this.botService.getSetup(guildId, channelId);
    const queueTime = existingSetup?.lastQueueTime
      ? existingSetup.lastQueueTime.toLocaleString()
      : new Date().toLocaleString();

    this.botService.resetSetup(guildId, channelId);

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

    await interaction.update({ embeds: [setupChannelEmbed], components });
  }
}
