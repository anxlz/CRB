import { Injectable } from '@nestjs/common';
import { Context, StringSelect, StringSelectContext, SelectedStrings } from 'necord';
import { BotService } from '../bot.service';
import {
  EMBED_COLOR,
  ROLE_EMOJIS,
  ROLE_DESCRIPTIONS,
  WeaponClassRole,
  WEAPONS,
} from '../../constants/game-data';

@Injectable()
export class RoleInteractionHandler {
  constructor(private readonly botService: BotService) {}

  @StringSelect('select_role1')
  public async onSelectRole1(
    @Context() [interaction]: StringSelectContext,
    @SelectedStrings() selected: string[],
  ) {
    const guildId = interaction.guildId!;
    const channelId = interaction.channelId;
    const role1 = selected[0] as WeaponClassRole;

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

    if (player.role2 === role1) {
      return interaction.reply({
        content: 'You cannot select the same role twice!',
        ephemeral: true,
      });
    }

    if (!this.botService.canSelectRole(setup, interaction.user.id, role1)) {
      return interaction.reply({
        content: `The ${ROLE_DESCRIPTIONS[role1]} role pool is full!`,
        ephemeral: true,
      });
    }

    if (player.role1) setup.rolePool[player.role1]++;
    player.role1 = role1;
    setup.rolePool[role1]--;

    if (player.role1 && player.role2) {
      await this.checkAndMoveToWeapons(interaction, setup);
    } else {
      await this.updateRoleEmbed(interaction, setup);
    }

    this.botService.updateSetup(guildId, channelId, setup);
  }

  @StringSelect('select_role2')
  public async onSelectRole2(
    @Context() [interaction]: StringSelectContext,
    @SelectedStrings() selected: string[],
  ) {
    const guildId = interaction.guildId!;
    const channelId = interaction.channelId;
    const role2 = selected[0] as WeaponClassRole;

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

    if (player.role1 === role2) {
      return interaction.reply({
        content: 'You cannot select the same role twice!',
        ephemeral: true,
      });
    }

    if (!this.botService.canSelectRole(setup, interaction.user.id, role2)) {
      return interaction.reply({
        content: `The ${ROLE_DESCRIPTIONS[role2]} role pool is full!`,
        ephemeral: true,
      });
    }

    if (player.role2) setup.rolePool[player.role2]++;
    player.role2 = role2;
    setup.rolePool[role2]--;

    if (player.role1 && player.role2) {
      await this.checkAndMoveToWeapons(interaction, setup);
    } else {
      await this.updateRoleEmbed(interaction, setup);
    }

    this.botService.updateSetup(guildId, channelId, setup);
  }

  private async updateRoleEmbed(interaction: any, setup: any) {
    const embed = {
      color: EMBED_COLOR,
      title: `🎮 Weapon Class Role Selection (${setup.players.length}/5)`,
      description:
        '**Select your 2 weapon class roles:**\n\n' +
        `${ROLE_EMOJIS[WeaponClassRole.AR]} **${ROLE_DESCRIPTIONS[WeaponClassRole.AR]}** - ${setup.rolePool[WeaponClassRole.AR]}/3 available\n` +
        `${ROLE_EMOJIS[WeaponClassRole.SMG]} **${ROLE_DESCRIPTIONS[WeaponClassRole.SMG]}** - ${setup.rolePool[WeaponClassRole.SMG]}/3 available\n` +
        `${ROLE_EMOJIS[WeaponClassRole.HEAVY]} **${ROLE_DESCRIPTIONS[WeaponClassRole.HEAVY]}** - ${setup.rolePool[WeaponClassRole.HEAVY]}/2 available\n` +
        `${ROLE_EMOJIS[WeaponClassRole.MARKSMAN]} **${ROLE_DESCRIPTIONS[WeaponClassRole.MARKSMAN]}** - ${setup.rolePool[WeaponClassRole.MARKSMAN]}/2 available\n\n` +
        '**Players:**\n' +
        setup.players
          .map((p) => {
            if (p.role1 && p.role2) {
              return `✅ ${p.username} - ${ROLE_EMOJIS[p.role1]} ${p.role1} / ${ROLE_EMOJIS[p.role2]} ${p.role2}`;
            } else if (p.role1) {
              return `⏳ ${p.username} - ${ROLE_EMOJIS[p.role1]} ${p.role1} / ?`;
            } else if (p.role2) {
              return `⏳ ${p.username} - ? / ${ROLE_EMOJIS[p.role2]} ${p.role2}`;
            }
            return `⏳ ${p.username} - Selecting...`;
          })
          .join('\n'),
      footer: { text: 'Select 2 different roles from the dropdowns below' },
    };

    const components = [
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: 'select_role1',
            placeholder: 'Select Primary Role',
            options: Object.values(WeaponClassRole).map((role) => ({
              label: ROLE_DESCRIPTIONS[role],
              value: role,
              emoji: { name: ROLE_EMOJIS[role] },
            })),
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: 'select_role2',
            placeholder: 'Select Secondary Role',
            options: Object.values(WeaponClassRole).map((role) => ({
              label: ROLE_DESCRIPTIONS[role],
              value: role,
              emoji: { name: ROLE_EMOJIS[role] },
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

  private async checkAndMoveToWeapons(interaction: any, setup: any) {
    if (!this.botService.allPlayersReady(setup, 'roles')) {
      await this.updateRoleEmbed(interaction, setup);
      return;
    }

    setup.currentPage = 'weapons';

    const embed = {
      color: EMBED_COLOR,
      title: '🔫 Weapon Selection',
      description:
        '**Select your weapons based on your assigned roles:**\n\n' +
        setup.players
          .map((p) => {
            const availableWeapons = this.botService.getAvailableWeapons(p);
            if (p.weapons && p.weapons.length > 0) {
              return `✅ ${p.username}: ${p.weapons.join(', ')}`;
            }
            return `⏳ ${p.username} (${ROLE_EMOJIS[p.role1!]} ${p.role1} / ${ROLE_EMOJIS[p.role2!]} ${p.role2})`;
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
