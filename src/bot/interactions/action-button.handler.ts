import { Injectable } from '@nestjs/common';
import { Context, Button, ButtonContext } from 'necord';
import { BotService } from '../bot.service';
import { EMBED_COLOR, ROLE_EMOJIS, ROLE_DESCRIPTIONS, WeaponClassRole } from '../../constants/game-data';

@Injectable()
export class ActionButtonHandler {
  constructor(private readonly botService: BotService) {}

  @Button('join_setup')
  public async onJoin(@Context() [interaction]: ButtonContext) {
    const guildId = interaction.guildId!;
    const channelId = interaction.channelId;

    let setup = this.botService.getSetup(guildId, channelId);
    if (!setup) {
      setup = this.botService.createSetup(guildId, channelId);
    }

    const added = this.botService.addPlayer(
      setup,
      interaction.user.id,
      interaction.user.username,
    );

    if (!added) {
      return interaction.reply({
        content: 'You are already in the setup or the team is full!',
        ephemeral: true,
      });
    }

    this.botService.updateSetup(guildId, channelId, setup);

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

  @Button('leave_setup')
  public async onLeave(@Context() [interaction]: ButtonContext) {
    const guildId = interaction.guildId!;
    const channelId = interaction.channelId;

    const setup = this.botService.getSetup(guildId, channelId);
    if (!setup) {
      return interaction.reply({
        content: 'No active setup found!',
        ephemeral: true,
      });
    }

    const removed = this.botService.removePlayer(setup, interaction.user.id);
    if (!removed) {
      return interaction.reply({
        content: 'You are not in this setup!',
        ephemeral: true,
      });
    }

    this.botService.updateSetup(guildId, channelId, setup);

    await interaction.reply({
      content: 'You have left the setup.',
      ephemeral: true,
    });
  }

  @Button('edit_roles')
  public async onEdit(@Context() [interaction]: ButtonContext) {
    return interaction.reply({
      content: 'Select new roles from the dropdowns above to update your selection.',
      ephemeral: true,
    });
  }
}
