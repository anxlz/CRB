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

    let setup = this.botService.getSetup(guildId, channelId);
    if (!setup) {
      setup = this.botService.createSetup(guildId, channelId);
      setup.messageId = interaction.message.id;
    }

    let player = setup.players.find((p) => p.userId === interaction.user.id);
    if (!player) {
      if (setup.players.length >= 5) {
        return interaction.reply({
          content: 'The setup is full! Maximum 5 players allowed.',
          ephemeral: true,
        });
      }

      player = {
        userId: interaction.user.id,
        username: interaction.user.username,
        role1: null,
        role2: null,
        weapons: [],
        operatorSkill: null,
      };
      setup.players.push(player);

    }

    const { role1, role2 } = parseRoleCombination(combination);

    if (player.role1) setup.rolePool[player.role1]++;
    if (player.role2) setup.rolePool[player.role2]++;

    if (setup.rolePool[role1] <= 0 || setup.rolePool[role2] <= 0) {
      if (player.role1) setup.rolePool[player.role1]--;
      if (player.role2) setup.rolePool[player.role2]--;
      
      this.botService.updateSetup(guildId, channelId, setup);
      
      return interaction.reply({
        content: `The role pool for this combination is full!`,
        ephemeral: true,
      });
    }
    
    player.role1 = role1;
    player.role2 = role2;
    setup.rolePool[role1]--;
    setup.rolePool[role2]--;


    const weapons = getRoleCombinationWeapons(combination);

    if (!weapons || weapons.length === 0) {
      return interaction.reply({
        content: 'No weapons available for this role combination!',
        ephemeral: true,
      });
    }

    const weaponOptions = weapons
      .slice(0, 25)
      .map((weapon) => ({
        label: this.botService.formatWithEmoji(guildId, 'weapon', weapon),
        value: weapon,
      }));

    const components = [
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: 'select_weapon_from_combination',
            placeholder: `Select 1st Weapon (${player.role1})`,
            options: weaponOptions,
          },
        ],
      },
    ];

    await interaction.reply({
      content: `You selected **${combination}**. Now choose your 1st weapon (${player.role1}):`,
      components,
      ephemeral: true,
    });

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

    // Get weapons only from role2 for the second weapon selection
    const { WEAPONS } = require('../../constants/game-data');
    const role2Weapons = WEAPONS[player.role2] || [];
    
    const weaponOptions = role2Weapons
      .filter(w => w !== weapon)
      .slice(0, 25)
      .map((w) => ({
        label: this.botService.formatWithEmoji(guildId, 'weapon', w),
        value: w,
      }));

    const components = [
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: 'select_second_weapon',
            placeholder: `Select 2nd Weapon (${player.role2})`,
            options: weaponOptions,
          },
        ],
      },
    ];

    const weaponWithEmoji = this.botService.formatWithEmoji(guildId, 'weapon', weapon);
    await interaction.update({
      content: `1st weapon selected: **${weaponWithEmoji}**\nNow choose your 2nd weapon (${player.role2}):`,
      components,
    });

    this.botService.updateSetup(guildId, channelId, setup);
  }

  @StringSelect('select_second_weapon')
  public async onSelectSecondWeapon(
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
    if (!player || !player.weapons) {
      return interaction.reply({
        content: 'You are not in this setup or have not selected your first weapon!',
        ephemeral: true,
      });
    }

    player.weapons.push(weapon);

    await interaction.update({
      content: `Weapons selected: **${player.weapons[0]}** and **${weapon}**`,
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

    const { WeaponClassRole } = require('../../constants/game-data');

    const statusEmoji = {
      waiting: '⏳',
      in_progress: '🔄',
      active: '✅',
      completed: '✔️'
    };

    const queueTime = setup.lastQueueTime ? setup.lastQueueTime.toLocaleString() : new Date().toLocaleString();

    const embed = {
      color: EMBED_COLOR,
      title: `Roster Setup ${statusEmoji[setup.status || 'waiting']} ${setup.status?.toUpperCase() || 'WAITING'}`,
      description:
        setup.players
          .map((p) => {
            if (p.role1 && p.role2 && p.weapons && p.weapons.length >= 2) {
              return `**${p.role1}/${p.role2}**\n<@${p.userId}> - ${p.weapons[0]}, ${p.weapons[1]} 2/2\n─────────────`;
            } else if (p.role1 && p.role2 && p.weapons && p.weapons.length === 1) {
              return `**${p.role1}/${p.role2}**\n<@${p.userId}> - ${p.weapons[0]} 1/2\n─────────────`;
            } else if (p.role1 && p.role2) {
              return `**${p.role1}/${p.role2}**\n<@${p.userId}> - 0/2\n─────────────`;
            }
            return `**Selecting...**\n0/2\n─────────────`;
          })
          .join('\n') + '\n\n' +
        `**AR** ${3 - setup.rolePool[WeaponClassRole.AR]}/3\n**SMG** ${3 - setup.rolePool[WeaponClassRole.SMG]}/3\n**Marksman** ${2 - setup.rolePool[WeaponClassRole.MARKSMAN]}/2\n**Heavy** ${2 - setup.rolePool[WeaponClassRole.HEAVY]}/2\n\n` +
        `Last Queue: ${queueTime}`,
      footer: { text: 'COD Mobile Roster' },
    };

    const components = [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 4,
            label: 'Leave',
            custom_id: 'leave_setup',
          },
          {
            type: 2,
            style: 2,
            label: 'Edit',
            custom_id: 'edit_roles',
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 3,
            label: '💡',
            custom_id: 'show_setup_steps',
          },
        ],
      },
    ];

    await message.edit({ embeds: [embed], components });
  }

  private async checkAndMoveToOperators(message: any, setup: any) {
    if (!this.botService.allPlayersReady(setup, 'weapons')) {
      const { WeaponClassRole } = require('../../constants/game-data');

      const statusEmoji = {
        waiting: '⏳',
        in_progress: '🔄',
        active: '✅',
        completed: '✔️'
      };

      const queueTime = setup.lastQueueTime ? setup.lastQueueTime.toLocaleString() : new Date().toLocaleString();

      const embed = {
        color: EMBED_COLOR,
        title: `Roster Setup ${statusEmoji[setup.status || 'waiting']} ${setup.status?.toUpperCase() || 'WAITING'}`,
        description:
          setup.players
            .map((p) => {
              if (p.role1 && p.role2 && p.weapons && p.weapons.length >= 2) {
                return `${p.role1}/${p.role2}\n<@${p.userId}> ${p.weapons[0]}, ${p.weapons[1]} 2/2`;
              } else if (p.role1 && p.role2 && p.weapons && p.weapons.length === 1) {
                return `${p.role1}/${p.role2}\n<@${p.userId}> ${p.weapons[0]} 1/2`;
              } else if (p.role1 && p.role2) {
                return `${p.role1}/${p.role2}\n0/2`;
              }
              return `Selecting...\n0/2`;
            })
            .join('\n') + '\n\n' +
          `AR ${3 - setup.rolePool[WeaponClassRole.AR]}/3\nSMG ${3 - setup.rolePool[WeaponClassRole.SMG]}/3\nMarksman ${2 - setup.rolePool[WeaponClassRole.MARKSMAN]}/2\nHeavy ${2 - setup.rolePool[WeaponClassRole.HEAVY]}/2\n\n` +
          `Last Queue: ${queueTime}`,
        footer: { text: 'COD Mobile Roster' },
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
              style: 4,
              label: 'Leave',
              custom_id: 'leave_setup',
            },
            {
              type: 2,
              style: 2,
              label: 'Edit',
              custom_id: 'edit_roles',
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 3,
              label: '💡',
              custom_id: 'show_setup_steps',
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
