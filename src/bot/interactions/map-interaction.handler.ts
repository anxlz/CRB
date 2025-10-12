import { Injectable } from '@nestjs/common';
import { Context, Button, ButtonContext } from 'necord';
import { BotService } from '../bot.service';
import {
  EMBED_COLOR,
  ROLE_EMOJIS,
  OPERATOR_EMOJIS,
  EQUIPMENT_EMOJIS,
} from '../../constants/game-data';

@Injectable()
export class MapInteractionHandler {
  constructor(private readonly botService: BotService) {}

  @Button('view_preview')
  public async onViewPreview(@Context() [interaction]: ButtonContext) {
    const guildId = interaction.guildId!;
    const channelId = interaction.channelId;

    const setup = this.botService.getSetup(guildId, channelId);
    if (!setup) {
      return interaction.reply({
        content: 'No active setup found!',
        ephemeral: true,
      });
    }

    const playersList = setup.players
      .map((p, index) => {
        const weapons = p.weapons ? p.weapons.join(', ') : 'None';
        return (
          `Player ${index + 1}: ${p.username}\n` +
          `Roles: ${p.role1} / ${p.role2}\n` +
          `Weapons: ${weapons}\n` +
          `Operator: ${p.operatorSkill}\n` +
          `Equipment: ${p.lethal} | ${p.tactical}`
        );
      })
      .join('\n\n');

    const embed = {
      color: EMBED_COLOR,
      title: 'Final Roster Setup',
      description:
        'Your team configuration is complete!\n\n' +
        playersList +
        '\n\nSetup Complete - Ready for Tournament!',
      footer: { text: 'COD Mobile Esports' },
      timestamp: new Date().toISOString(),
    };

    const components = [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 2,
            label: 'Start New Setup',
            custom_id: 'new_setup',
          },
        ],
      },
    ];

    await interaction.update({ embeds: [embed], components });
  }

  @Button('edit_maps')
  public async onEditMaps(@Context() [interaction]: ButtonContext) {
    return interaction.reply({
      content: 'Map voting feature coming soon! Click View Setup to see your roster.',
      ephemeral: true,
    });
  }

  @Button('new_setup')
  public async onNewSetup(@Context() [interaction]: ButtonContext) {
    const guildId = interaction.guildId!;
    const channelId = interaction.channelId;

    this.botService.resetSetup(guildId, channelId);

    const setupChannelEmbed = {
      color: EMBED_COLOR,
      title: 'Anxiety Rank 5 Queue',
      description:
        'This is the start of the Queue channel.\n\n' +
        'War Machine/Gravity Spikes 0/2\n' +
        'Equalizer/Purifier 0/2\n' +
        'Death Machine/Gravity Vortex 0/2\n' +
        'Sparrow/Claw 0/2\n' +
        'Annihilator/Tempest 0/2',
      footer: { text: '13/09/2025, 5:51PM' },
    };

    const components = [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 1,
            label: 'Join Queue',
            custom_id: 'join_setup',
          },
          {
            type: 2,
            style: 4,
            label: 'Leave Queue',
            custom_id: 'leave_setup',
          },
        ],
      },
    ];

    await interaction.update({
      embeds: [setupChannelEmbed],
      components,
    });
  }
}
