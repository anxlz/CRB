import { Injectable } from '@nestjs/common';
import { Context, Button, ButtonContext } from 'necord';
import { BotService } from '../bot.service';
import {
  EMBED_COLOR,
  LETHAL_EQUIPMENT,
  TACTICAL_EQUIPMENT,
  EQUIPMENT_EMOJIS,
  MAPS,
  MAP_EMOJIS,
} from '../../constants/game-data';

@Injectable()
export class EquipmentInteractionHandler {
  constructor(private readonly botService: BotService) {}

  @Button('select_lethal_:lethalName')
  public async onSelectLethal(@Context() [interaction]: ButtonContext) {
    const guildId = interaction.guildId!;
    const channelId = interaction.channelId;
    const lethalName = interaction.customId.replace('select_lethal_', '').replace(/_/g, ' ');

    const setup = this.botService.getSetup(guildId, channelId);
    if (!setup) {
      return interaction.reply({
        content: 'No active setup found!',
        ephemeral: true,
      });
    }

    const player = setup.players.find((p) => p.userId === interaction.user.id);
    if (!player) {
      return interaction.reply({
        content: 'You are not in this setup!',
        ephemeral: true,
      });
    }

    player.lethal = lethalName;

    if (this.botService.allPlayersReady(setup, 'equipment')) {
      await this.moveToMaps(interaction, setup);
    } else {
      await this.updateEquipmentEmbed(interaction, setup);
    }

    this.botService.updateSetup(guildId, channelId, setup);
  }

  @Button('select_tactical_:tacticalName')
  public async onSelectTactical(@Context() [interaction]: ButtonContext) {
    const guildId = interaction.guildId!;
    const channelId = interaction.channelId;
    const tacticalName = interaction.customId.replace('select_tactical_', '').replace(/_/g, ' ');

    const setup = this.botService.getSetup(guildId, channelId);
    if (!setup) {
      return interaction.reply({
        content: 'No active setup found!',
        ephemeral: true,
      });
    }

    const player = setup.players.find((p) => p.userId === interaction.user.id);
    if (!player) {
      return interaction.reply({
        content: 'You are not in this setup!',
        ephemeral: true,
      });
    }

    const currentCount = this.botService.getTacticalCount(setup, tacticalName);
    if (currentCount >= 3 && player.tactical !== tacticalName) {
      return interaction.reply({
        content: `${tacticalName} is already at max capacity (3/3)!`,
        ephemeral: true,
      });
    }

    player.tactical = tacticalName;

    if (this.botService.allPlayersReady(setup, 'equipment')) {
      await this.moveToMaps(interaction, setup);
    } else {
      await this.updateEquipmentEmbed(interaction, setup);
    }

    this.botService.updateSetup(guildId, channelId, setup);
  }

  @Button('edit_equipment')
  public async onEditEquipment(@Context() [interaction]: ButtonContext) {
    return interaction.reply({
      content: 'Click different equipment buttons above to change your selection.',
      ephemeral: true,
    });
  }

  private async updateEquipmentEmbed(interaction: any, setup: any) {
    const embed = {
      color: EMBED_COLOR,
      title: '💣 Lethal & Tactical Equipment',
      description:
        '**Select your equipment:**\n\n' +
        '**Lethal:** No limit\n' +
        '**Tactical:** Max 3 per type\n\n' +
        setup.players
          .map((p) => {
            const status = [];
            if (p.lethal) status.push(`${EQUIPMENT_EMOJIS[p.lethal]} ${p.lethal}`);
            if (p.tactical) status.push(`${EQUIPMENT_EMOJIS[p.tactical]} ${p.tactical}`);
            if (status.length === 2) {
              return `✅ ${p.username}: ${status.join(' | ')}`;
            }
            return `⏳ ${p.username} - Selecting...`;
          })
          .join('\n') +
        '\n\n**Tactical Limits:**\n' +
        TACTICAL_EQUIPMENT.map((tac) => {
          const count = this.botService.getTacticalCount(setup, tac);
          return `${EQUIPMENT_EMOJIS[tac]} ${tac}: ${count}/3`;
        }).join('\n'),
      footer: { text: 'Green = Lethal | Blue/Gray = Tactical' },
    };

    const lethalButtons = LETHAL_EQUIPMENT.map((lethal) => ({
      type: 2,
      style: 3,
      label: lethal,
      custom_id: `select_lethal_${lethal.replace(/\s+/g, '_')}`,
      emoji: { name: EQUIPMENT_EMOJIS[lethal] },
    }));

    const tacticalButtons = TACTICAL_EQUIPMENT.map((tactical) => {
      const count = this.botService.getTacticalCount(setup, tactical);
      return {
        type: 2,
        style: count >= 3 ? 2 : 1,
        label: tactical,
        custom_id: `select_tactical_${tactical.replace(/\s+/g, '_')}`,
        emoji: { name: EQUIPMENT_EMOJIS[tactical] },
        disabled: count >= 3,
      };
    });

    const components = [
      {
        type: 1,
        components: lethalButtons,
      },
      {
        type: 1,
        components: tacticalButtons,
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 2,
            label: 'Edit',
            custom_id: 'edit_equipment',
            emoji: { name: '✏️' },
          },
          {
            type: 2,
            style: 4,
            label: 'Leave',
            custom_id: 'leave_setup',
            emoji: { name: '❌' },
          },
        ],
      },
    ];

    await interaction.update({ embeds: [embed], components });
  }

  private async moveToMaps(interaction: any, setup: any) {
    setup.currentPage = 'maps';

    const modeDescriptions = Object.keys(MAPS)
      .map((mode) => `${MAP_EMOJIS[mode]} **${mode}:**\n${MAPS[mode].join(', ')}`)
      .join('\n\n');

    const embed = {
      color: EMBED_COLOR,
      title: '🗺️ Map Voting',
      description:
        '**Vote for your preferred maps:**\n\n' +
        modeDescriptions +
        '\n\n_Map voting feature coming soon!_\n\n' +
        'Click **View Setup** to see your final roster configuration.',
      footer: { text: 'Click View Setup to review' },
    };

    const components = [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 1,
            label: 'View Setup',
            custom_id: 'view_preview',
            emoji: { name: '📋' },
          },
          {
            type: 2,
            style: 2,
            label: 'Edit',
            custom_id: 'edit_maps',
            emoji: { name: '✏️' },
          },
          {
            type: 2,
            style: 4,
            label: 'Leave',
            custom_id: 'leave_setup',
            emoji: { name: '❌' },
          },
        ],
      },
    ];

    await interaction.update({ embeds: [embed], components });
  }
}
