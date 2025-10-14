import { Injectable } from '@nestjs/common';
import { Context, Button, ButtonContext, StringSelect, StringSelectContext, SelectedStrings } from 'necord';
import { BotService } from '../bot.service';
import {
  EMBED_COLOR,
  LETHAL_EQUIPMENT,
  TACTICAL_EQUIPMENT,
} from '../../constants/game-data';

@Injectable()
export class EquipmentInteractionHandler {
  constructor(private readonly botService: BotService) {}

  @StringSelect('select_lethal')
  public async onSelectLethal(
    @Context() [interaction]: StringSelectContext,
    @SelectedStrings() selected: string[],
  ) {
    const guildId = interaction.guildId!;
    const channelId = interaction.channelId;
    const lethalName = selected[0];

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

  @StringSelect('select_tactical')
  public async onSelectTactical(
    @Context() [interaction]: StringSelectContext,
    @SelectedStrings() selected: string[],
  ) {
    const guildId = interaction.guildId!;
    const channelId = interaction.channelId;
    const tacticalName = selected[0];

    if (tacticalName === 'none') {
      return interaction.reply({
        content: 'No tactical equipment available. All tactical equipment is at max capacity (3/3)!',
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
      content: 'Select different equipment from the dropdowns above to change your selection.',
      ephemeral: true,
    });
  }

  private async updateEquipmentEmbed(interaction: any, setup: any) {
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
        `\n\nLast Queue Date: ${queueTime}`,
      footer: { text: 'COD Mobile Esports' },
    };

    const components = [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 2,
            label: 'Start New Setup',
            custom_id: 'new_setup',
          },
        ],
      },
    ];

    await interaction.update({ embeds: [embed], components });
    
    const setupText = setup.players
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
    
    this.botService.sendLog(guildId, `[ROSTER COMPLETE]\n\n${setupText}`);
  }
}
