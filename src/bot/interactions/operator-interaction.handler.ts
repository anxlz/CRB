import { Injectable } from '@nestjs/common';
import { Context, Button, ButtonContext, StringSelect, StringSelectContext, SelectedStrings } from 'necord';
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

  @StringSelect('select_operator')
  public async onSelectOperator(
    @Context() [interaction]: StringSelectContext,
    @SelectedStrings() selected: string[],
  ) {
    const guildId = interaction.guildId!;
    const channelId = interaction.channelId;
    const operatorName = selected[0];

    if (operatorName === 'none') {
      return interaction.reply({
        content: 'No operators are available. All operators have been taken!',
        ephemeral: true,
      });
    }

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

    const operatorWithEmoji = this.botService.formatWithEmoji(guildId, 'operator', operatorName);
    await interaction.reply({
      content: `You selected: **${operatorWithEmoji}**`,
      ephemeral: true,
    });

    this.botService.updateSetup(guildId, channelId, setup);

    const message = await interaction.channel?.messages.fetch(setup.messageId!);
    if (message) {
      if (this.botService.allPlayersReady(setup, 'operators')) {
        await this.moveToEquipment(message, setup);
      } else {
        await this.updateOperatorEmbed(message, setup);
      }
    }
  }

  @Button('edit_operators')
  public async onEditOperators(@Context() [interaction]: ButtonContext) {
    return interaction.reply({
      content: 'Select a different operator from the dropdown above to change your selection.',
      ephemeral: true,
    });
  }

  private async updateOperatorEmbed(message: any, setup: any) {
    const guildId = setup.guildId;
    
    const embed = {
      color: EMBED_COLOR,
      title: 'Operator Skills Selection',
      description:
        'Each player must select a unique operator skill:\n\n' +
        setup.players
          .map((p) => {
            if (p.operatorSkill) {
              return `${p.username}: ${this.botService.formatWithEmoji(guildId, 'operator', p.operatorSkill)}`;
            }
            return `${p.username} - Selecting...`;
          })
          .join('\n') +
        '\n\nAvailable Operators:\n' +
        OPERATOR_SKILLS.map((op) => {
          const taken = setup.players.find((p) => p.operatorSkill === op);
          const opWithEmoji = this.botService.formatWithEmoji(guildId, 'operator', op);
          return taken ? `${opWithEmoji} (${taken.username})` : opWithEmoji;
        }).join('\n'),
      footer: { text: 'Select from the dropdown below - Each must be unique!' },
    };

    const takenOperators = setup.players
      .filter((p) => p.operatorSkill)
      .map((p) => p.operatorSkill);

    const operatorOptions = OPERATOR_SKILLS.map((op) => ({
      label: this.botService.formatWithEmoji(guildId, 'operator', op),
      value: op,
      description: takenOperators.includes(op) ? `Taken by ${setup.players.find(p => p.operatorSkill === op)?.username}` : undefined,
    })).filter((op) => !takenOperators.includes(op.value));

    const components = [
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: 'select_operator',
            placeholder: 'Select Operator Skill',
            min_values: 1,
            max_values: 1,
            options: operatorOptions.length > 0 ? operatorOptions : [{ label: 'No operators available', value: 'none', description: 'All operators taken' }],
          },
        ],
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

    await message.edit({ embeds: [embed], components });
  }

  private async moveToEquipment(message: any, setup: any) {
    setup.currentPage = 'equipment';
    const guildId = setup.guildId;

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
            if (p.lethal) status.push(this.botService.formatWithEmoji(guildId, 'lethal', p.lethal));
            if (p.tactical) status.push(this.botService.formatWithEmoji(guildId, 'tactical', p.tactical));
            if (status.length === 2) {
              return `${p.username}: ${status.join(' | ')}`;
            }
            return `${p.username} - Selecting...`;
          })
          .join('\n') +
        '\n\nTactical Limits:\n' +
        TACTICAL_EQUIPMENT.map((tac) => {
          const count = this.botService.getTacticalCount(setup, tac);
          return `${this.botService.formatWithEmoji(guildId, 'tactical', tac)}: ${count}/3`;
        }).join('\n'),
      footer: { text: 'Select from the dropdowns below' },
    };

    const lethalOptions = LETHAL_EQUIPMENT.map((lethal) => ({
      label: this.botService.formatWithEmoji(guildId, 'lethal', lethal),
      value: lethal,
    }));

    const tacticalOptions = TACTICAL_EQUIPMENT.map((tactical) => {
      const count = this.botService.getTacticalCount(setup, tactical);
      return {
        label: this.botService.formatWithEmoji(guildId, 'tactical', tactical),
        value: tactical,
        description: `${count}/3 used`,
      };
    }).filter((tac) => {
      const count = this.botService.getTacticalCount(setup, tac.value);
      return count < 3;
    });

    const components = [
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: 'select_lethal',
            placeholder: 'Select Lethal Equipment',
            min_values: 1,
            max_values: 1,
            options: lethalOptions,
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: 'select_tactical',
            placeholder: 'Select Tactical Equipment',
            min_values: 1,
            max_values: 1,
            options: tacticalOptions.length > 0 ? tacticalOptions : [{ label: 'All tactical at max', value: 'none', description: 'All at 3/3 capacity' }],
          },
        ],
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

    await message.edit({ embeds: [embed], components });
  }
}
