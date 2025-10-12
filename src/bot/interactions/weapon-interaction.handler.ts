import { Injectable } from '@nestjs/common';
import { Context, StringSelect, StringSelectContext, SelectedStrings, Button, ButtonContext } from 'necord';
import { BotService } from '../bot.service';
import {
  EMBED_COLOR,
  OPERATOR_SKILLS,
} from '../../constants/game-data';

@Injectable()
export class WeaponInteractionHandler {
  constructor(private readonly botService: BotService) {}

  @StringSelect('select_weapons')
  public async onSelectWeapons(
    @Context() [interaction]: StringSelectContext,
    @SelectedStrings() selected: string[],
  ) {
    const guildId = interaction.guildId!;
    const channelId = interaction.channelId;

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

    player.weapons = selected;

    if (this.botService.allPlayersReady(setup, 'weapons')) {
      await this.moveToOperators(interaction, setup);
    } else {
      await this.updateWeaponEmbed(interaction, setup);
    }

    this.botService.updateSetup(guildId, channelId, setup);
  }

  @Button('edit_weapons')
  public async onEditWeapons(@Context() [interaction]: ButtonContext) {
    return interaction.reply({
      content: 'Select new weapons from the dropdown above to update your selection.',
      ephemeral: true,
    });
  }

  private async updateWeaponEmbed(interaction: any, setup: any) {
    const embed = {
      color: EMBED_COLOR,
      title: 'Weapon Selection',
      description:
        'Select your weapons based on your assigned roles:\n\n' +
        setup.players
          .map((p) => {
            if (p.weapons && p.weapons.length > 0) {
              return `${p.username}: ${p.weapons.join(', ')}`;
            }
            return `${p.username} (${p.role1} / ${p.role2})`;
          })
          .join('\n'),
      footer: { text: 'Select weapons from the dropdown below' },
    };

    const player = setup.players.find((p) => p.userId === interaction.user.id);
    const availableWeapons = this.botService.getAvailableWeapons(player);

    const components = [
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: 'select_weapons',
            placeholder: 'Select Your Weapons',
            min_values: 1,
            max_values: Math.min(availableWeapons.length, 25),
            options: availableWeapons.map((weapon) => ({
              label: weapon,
              value: weapon,
            })),
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
            custom_id: 'edit_weapons',
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

  private async moveToOperators(interaction: any, setup: any) {
    setup.currentPage = 'operators';

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
}
