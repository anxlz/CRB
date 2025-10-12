import { Injectable } from '@nestjs/common';
import { Context, Button, ButtonContext } from 'necord';
import { BotService } from '../bot.service';
import { EMBED_COLOR, ROLE_COMBINATIONS } from '../../constants/game-data';

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
      setup.messageId = interaction.message.id;
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
            style: 1,
            label: 'Join',
            custom_id: 'join_setup',
          },
          {
            type: 2,
            style: 4,
            label: 'Leave',
            custom_id: 'leave_setup',
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

    const message = await interaction.channel?.messages.fetch(setup.messageId!);
    if (message) {
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
              style: 1,
              label: 'Join',
              custom_id: 'join_setup',
            },
            {
              type: 2,
              style: 4,
              label: 'Leave',
              custom_id: 'leave_setup',
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
          ],
        },
      ];

      await message.edit({ embeds: [embed], components });
    }
  }

  @Button('edit_roles')
  public async onEdit(@Context() [interaction]: ButtonContext) {
    return interaction.reply({
      content: 'Select a new role combination from the dropdown above to update your selection.',
      ephemeral: true,
    });
  }
}
