import { Injectable } from '@nestjs/common';
import { Context, StringSelect, StringSelectContext, SelectedStrings } from 'necord';
import { BotService } from '../bot.service';
import {
  EMBED_COLOR,
  ROLE_COMBINATIONS,
  parseRoleCombination,
  getRoleCombinationWeapons,
} from '../../constants/game-data';

@Injectable()
export class RoleInteractionHandler {
  constructor(private readonly botService: BotService) {}

  @StringSelect('select_role_combination')
  public async onSelectRoleCombination(
    @Context() [interaction]: StringSelectContext,
    @SelectedStrings() selected: string[],
  ) {
    const guildId = interaction.guildId!;
    const channelId = interaction.channelId;
    const combination = selected[0];

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

    const { role1, role2 } = parseRoleCombination(combination);

    if (!this.botService.canSelectRole(setup, interaction.user.id, role1) ||
        !this.botService.canSelectRole(setup, interaction.user.id, role2)) {
      return interaction.reply({
        content: `The role pool for this combination is full!`,
        ephemeral: true,
      });
    }

    const weapons = getRoleCombinationWeapons(combination);

    const weaponOptions = weapons.map((weapon) => ({
      label: weapon,
      value: weapon,
    }));

    const components = [
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: 'select_weapon_from_combination',
            placeholder: 'Select Your Weapon',
            options: weaponOptions,
          },
        ],
      },
    ];

    await interaction.reply({
      content: `You selected **${combination}**. Now choose your weapon:`,
      components,
      ephemeral: true,
    });

    if (player.role1) setup.rolePool[player.role1]++;
    if (player.role2) setup.rolePool[player.role2]++;
    
    player.role1 = role1;
    player.role2 = role2;
    setup.rolePool[role1]--;
    setup.rolePool[role2]--;

    this.botService.updateSetup(guildId, channelId, setup);

    await this.updateRoleEmbed(interaction, setup);
  }

  @StringSelect('select_weapon_from_combination')
  public async onSelectWeaponFromCombination(
    @Context() [interaction]: StringSelectContext,
    @SelectedStrings() selected: string[],
  ) {
    const guildId = interaction.guildId!;
    const channelId = interaction.channelId;
    const weapon = selected[0];

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

    player.weapons = [weapon];

    await interaction.update({
      content: `Weapon selected: **${weapon}**`,
      components: [],
    });

    this.botService.updateSetup(guildId, channelId, setup);

    const message = await interaction.channel?.messages.fetch(setup.messageId!);
    if (message) {
      await this.checkAndMoveToOperators(message, setup);
    }
  }

  private async updateRoleEmbed(interaction: any, setup: any) {
    const message = await interaction.channel?.messages.fetch(setup.messageId!);
    if (!message) return;

    const embed = {
      color: EMBED_COLOR,
      title: `Anxiety Rank 5 Queue`,
      description:
        setup.players
          .map((p) => {
            if (p.role1 && p.role2 && p.weapons && p.weapons.length > 0) {
              return `${p.role1}/${p.role2} ${p.weapons[0]} 1/1`;
            } else if (p.role1 && p.role2) {
              return `${p.role1}/${p.role2} 0/1`;
            }
            return `Selecting... 0/1`;
          })
          .join('\n') + '\n\n' +
        `AR 0/3\nSMG 0/3\nMarksman 0/2\nHeavy 0/2`,
      footer: { text: `15/09/2025, 5:51PM` },
    };

    const components = [
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: 'select_role_combination',
            placeholder: 'Select Role Combination',
            options: ROLE_COMBINATIONS.map((combo) => ({
              label: combo,
              value: combo,
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
            custom_id: 'edit_roles',
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

  private async checkAndMoveToOperators(message: any, setup: any) {
    if (!this.botService.allPlayersReady(setup, 'weapons')) {
      const embed = {
        color: EMBED_COLOR,
        title: `Anxiety Rank 5 Queue`,
        description:
          setup.players
            .map((p) => {
              if (p.role1 && p.role2 && p.weapons && p.weapons.length > 0) {
                return `${p.role1}/${p.role2} ${p.weapons[0]} 1/1`;
              } else if (p.role1 && p.role2) {
                return `${p.role1}/${p.role2} 0/1`;
              }
              return `Selecting... 0/1`;
            })
            .join('\n') + '\n\n' +
          `AR 0/3\nSMG 0/3\nMarksman 0/2\nHeavy 0/2`,
        footer: { text: `15/09/2025, 5:51PM` },
      };

      const components = [
        {
          type: 1,
          components: [
            {
              type: 3,
              custom_id: 'select_role_combination',
              placeholder: 'Select Role Combination',
              options: ROLE_COMBINATIONS.map((combo) => ({
                label: combo,
                value: combo,
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
              custom_id: 'edit_roles',
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
      return;
    }

    setup.currentPage = 'operators';

    const { OPERATOR_SKILLS } = require('../../constants/game-data');

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

    await message.edit({ embeds: [embed], components });
  }
}
