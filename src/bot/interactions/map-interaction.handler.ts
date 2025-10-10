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
          `**Player ${index + 1}: ${p.username}**\n` +
          `├ Roles: ${ROLE_EMOJIS[p.role1!]} ${p.role1} / ${ROLE_EMOJIS[p.role2!]} ${p.role2}\n` +
          `├ Weapons: ${weapons}\n` +
          `├ Operator: ${OPERATOR_EMOJIS[p.operatorSkill!]} ${p.operatorSkill}\n` +
          `└ Equipment: ${EQUIPMENT_EMOJIS[p.lethal!]} ${p.lethal} | ${EQUIPMENT_EMOJIS[p.tactical!]} ${p.tactical}`
        );
      })
      .join('\n\n');

    const embed = {
      color: EMBED_COLOR,
      title: '📋 Final Roster Setup',
      description:
        '**Your team configuration is complete!**\n\n' +
        playersList +
        '\n\n✅ Setup Complete - Ready for Tournament!',
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
            emoji: { name: '🔄' },
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

    await interaction.update({
      embeds: [setupChannelEmbed],
      components,
    });
  }
}
