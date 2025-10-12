import { Injectable } from '@nestjs/common';
import { Context, Button, ButtonContext } from 'necord';
import { BotService } from '../bot.service';
import {
  EMBED_COLOR,
  LETHAL_EQUIPMENT,
  TACTICAL_EQUIPMENT,
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

    this.botService.sendLog(guildId, '[LETHAL SELECTED]', {
      channelId,
      userId: interaction.user.id,
      username: player.username,
      lethal: lethalName,
      status: 'lethal_selected'
    });

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

    this.botService.sendLog(guildId, '[TACTICAL SELECTED]', {
      channelId,
      userId: interaction.user.id,
      username: player.username,
      tactical: tacticalName,
      status: 'tactical_selected'
    });

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

  private async moveToMaps(interaction: any, setup: any) {
    const guildId = setup.guildId;
    const channelId = setup.channelId;
    
    const queueTime = setup.lastQueueTime ? setup.lastQueueTime.toLocaleString() : new Date().toLocaleString();
    
    const playersList = setup.players
      .map((p, index) => {
        const weapons = p.weapons ? p.weapons.join(', ') : 'None';
        return (
          `Player ${index + 1}: ${p.username}\n` +
          `Roles: ${p.role1} / ${p.role2}\n` +
          `Weapons: ${weapons}\n` +
          `Operator: ${p.operatorSkill}\n` +
          `Equipment: ${p.lethal} | ${p.tactical}`
        );
      })
      .join('\n\n');

    const embed = {
      color: EMBED_COLOR,
      title: '✔️ Roster Setup COMPLETED',
      description:
        'Your team configuration is complete!\n\n' +
        playersList +
        '\n\nSetup Complete - Ready for Tournament!' +
        `\n\nLast Queue: ${queueTime}`,
      footer: { text: 'COD Mobile Esports' },
    };

    const managerRoleId = this.botService.getManagerRole(guildId);
    const hasManagerRole = !managerRoleId || interaction.member?.roles?.cache?.has(managerRoleId);

    const components = [];
    if (hasManagerRole) {
      components.push({
        type: 1,
        components: [
          {
            type: 2,
            style: 2,
            label: 'Start New Setup',
            custom_id: 'new_setup',
          },
        ],
      });
    }

    await interaction.update({ embeds: [embed], components });
    
    this.botService.sendLog(guildId, '[ROSTER COMPLETE]', {
      channelId,
      players: setup.players.map(p => ({
        userId: p.userId,
        username: p.username,
        role1: p.role1,
        role2: p.role2,
        weapons: p.weapons,
        operatorSkill: p.operatorSkill,
        lethal: p.lethal,
        tactical: p.tactical,
        status: 'completed'
      }))
    });
  }
}
