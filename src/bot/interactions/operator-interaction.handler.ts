import { Injectable } from '@nestjs/common';
import { Context, Button, ButtonContext } from 'necord';
import { BotService } from '../bot.service';
import {
  EMBED_COLOR,
  OPERATOR_SKILLS,
  LETHAL_EQUIPMENT,
  TACTICAL_EQUIPMENT,
} from '../../constants/game-data';

@Injectable()
export class OperatorInteractionHandler {
  constructor(private readonly botService: BotService) {}

  @Button('select_operator_:operatorName')
  public async onSelectOperator(@Context() [interaction]: ButtonContext) {
    const guildId = interaction.guildId!;
    const channelId = interaction.channelId;
    const operatorName = interaction.customId.replace('select_operator_', '').replace(/_/g, ' ');

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

    if (!this.botService.canSelectOperator(setup, interaction.user.id, operatorName)) {
      return interaction.reply({
        content: `${operatorName} is already taken by another player!`,
        ephemeral: true,
      });
    }

    player.operatorSkill = operatorName;

    this.botService.sendLog(guildId, '[OPERATOR SELECTED]', {
      channelId,
      userId: interaction.user.id,
      username: player.username,
      operator: operatorName,
      status: 'operator_selected'
    });

    if (this.botService.allPlayersReady(setup, 'operators')) {
      await this.moveToEquipment(interaction, setup);
    } else {
      await this.updateOperatorEmbed(interaction, setup);
    }

    this.botService.updateSetup(guildId, channelId, setup);
  }

  @Button('edit_operators')
  public async onEditOperators(@Context() [interaction]: ButtonContext) {
    return interaction.reply({
      content: 'Click a different operator button above to change your selection.',
      ephemeral: true,
    });
  }

  private async updateOperatorEmbed(interaction: any, setup: any) {
    const embed = {
      color: EMBED_COLOR,
      title: 'Operator Skills Selection',
      description:
        'Each player must select a unique operator skill:\n\n' +
        setup.players
          .map((p) => {
            if (p.operatorSkill) {
              return `${p.username}: ${p.operatorSkill}`;
            }
            return `${p.username} - Selecting...`;
          })
          .join('\n') +
        '\n\nAvailable Operators:\n' +
        OPERATOR_SKILLS.map((op) => {
          const taken = setup.players.find((p) => p.operatorSkill === op);
          return taken ? `${op} (${taken.username})` : op;
        }).join('\n'),
      footer: { text: 'Click an operator button below - Each must be unique!' },
    };

    const takenOperators = setup.players
      .filter((p) => p.operatorSkill)
      .map((p) => p.operatorSkill);

    const operatorButtons = OPERATOR_SKILLS.map((op) => ({
      type: 2,
      style: takenOperators.includes(op) ? 2 : 1,
      label: op,
      custom_id: `select_operator_${op.replace(/\s+/g, '_')}`,
      disabled: takenOperators.includes(op),
    }));

    const components = [
      {
        type: 1,
        components: operatorButtons.slice(0, 5),
      },
      {
        type: 1,
        components: operatorButtons.slice(5, 9),
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 2,
            label: 'Edit',
            custom_id: 'edit_operators',
          },
          {
            type: 2,
            style: 4,
            label: 'Leave',
            custom_id: 'leave_setup',
          },
        ],
      },
    ];

    await interaction.update({ embeds: [embed], components });
  }

  private async moveToEquipment(interaction: any, setup: any) {
    setup.currentPage = 'equipment';

    const embed = {
      color: EMBED_COLOR,
      title: 'Lethal & Tactical Equipment',
      description:
        'Select your equipment:\n\n' +
        'Lethal: No limit\n' +
        'Tactical: Max 3 per type\n\n' +
        setup.players
          .map((p) => {
            const status = [];
            if (p.lethal) status.push(p.lethal);
            if (p.tactical) status.push(p.tactical);
            if (status.length === 2) {
              return `${p.username}: ${status.join(' | ')}`;
            }
            return `${p.username} - Selecting...`;
          })
          .join('\n') +
        '\n\nTactical Limits:\n' +
        TACTICAL_EQUIPMENT.map((tac) => {
          const count = this.botService.getTacticalCount(setup, tac);
          return `${tac}: ${count}/3`;
        }).join('\n'),
      footer: { text: 'Green = Lethal | Blue/Gray = Tactical' },
    };

    const lethalButtons = LETHAL_EQUIPMENT.map((lethal) => ({
      type: 2,
      style: 3,
      label: lethal,
      custom_id: `select_lethal_${lethal.replace(/\s+/g, '_')}`,
    }));

    const tacticalButtons = TACTICAL_EQUIPMENT.map((tactical) => {
      const count = this.botService.getTacticalCount(setup, tactical);
      return {
        type: 2,
        style: count >= 3 ? 2 : 1,
        label: tactical,
        custom_id: `select_tactical_${tactical.replace(/\s+/g, '_')}`,
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
          },
          {
            type: 2,
            style: 4,
            label: 'Leave',
            custom_id: 'leave_setup',
          },
        ],
      },
    ];

    await interaction.update({ embeds: [embed], components });
  }
}
