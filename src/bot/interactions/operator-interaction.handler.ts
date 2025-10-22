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

  // Helper to truncate labels to Discord's 100-char limit
  private truncateLabel(label: string, maxLength: number = 100): string {
    if (label.length <= maxLength) return label;
    return label.substring(0, maxLength - 3) + '...';
  }

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

    this.botService.updateSetup(guildId, channelId, setup);

    const message = await interaction.channel?.messages.fetch(setup.messageId!);
    if (message) {
      if (this.botService.allPlayersReady(setup, 'operators')) {
        await this.moveToEquipment(message, setup);
      } else {
        await this.updateOperatorEmbed(message, setup);
      }
    }

    const operatorWithEmoji = this.botService.formatWithEmoji(guildId, 'operator', operatorName);
    await interaction.reply({
      content: `You selected: **${operatorWithEmoji}**`,
      ephemeral: true,
    });
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
      title: '**Operator Skills Selection**',
      description:
        '**Each player must select a unique operator skill:**\n\n' +
        setup.players
          .map((p) => {
            if (p.operatorSkill) {
              return `**<@${p.userId}>: ${this.botService.formatWithEmoji(guildId, 'operator', p.operatorSkill)}**`;
            }
            return `**<@${p.userId}> - Selecting...**`;
          })
          .join('\n') +
        '\n\n**Available Operators:**\n' +
        OPERATOR_SKILLS.map((op) => {
          const taken = setup.players.find((p) => p.operatorSkill === op);
          const opWithEmoji = this.botService.formatWithEmoji(guildId, 'operator', op);
          return taken ? `**${opWithEmoji} (<@${taken.userId}>)**` : `**${opWithEmoji}**`;
        }).join('\n'),
      footer: { text: 'Select from the dropdown below - Each must be unique!' },
      image: {
        url: 'https://media.discordapp.net/attachments/1413190110694084789/1430281339231277066/bwDlFcd.png?ex=68f9dd8c&is=68f88c0c&hm=07f8d5ab727cce9b9122a8a17ecbc9dd53425a229cb9f666ad05dd112221194d&=&format=png&quality=lossless&width=400&height=63'
      },
    };

    const takenOperators = setup.players
      .filter((p) => p.operatorSkill)
      .map((p) => p.operatorSkill);

    const operatorOptions = OPERATOR_SKILLS.map((op) => {
      const labelWithEmoji = this.botService.formatWithEmoji(guildId, 'operator', op);
      const takenPlayer = setup.players.find(p => p.operatorSkill === op);
      const description = takenOperators.includes(op) ? `Taken by <@${takenPlayer?.userId}>` : undefined;
      
      return {
        label: this.truncateLabel(labelWithEmoji),
        value: op,
        description: description ? this.truncateLabel(description, 100) : undefined,
      };
    }).filter((op) => !takenOperators.includes(op.value));

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
      title: '**Lethal & Tactical Equipment**',
      description:
        '**Select your equipment:**\n\n' +
        '**Lethal: No limit**\n' +
        '**Tactical: Max 3 per type**\n\n' +
        setup.players
          .map((p) => {
            const status = [];
            if (p.lethal) status.push(this.botService.formatWithEmoji(guildId, 'lethal', p.lethal));
            if (p.tactical) status.push(this.botService.formatWithEmoji(guildId, 'tactical', p.tactical));
            if (status.length === 2) {
              return `**<@${p.userId}>: ${status.join(' | ')}**`;
            }
            return `**<@${p.userId}> - Selecting...**`;
          })
          .join('\n') +
        '\n\n**Tactical Limits:**\n' +
        TACTICAL_EQUIPMENT.map((tac) => {
          const count = this.botService.getTacticalCount(setup, tac);
          return `**${this.botService.formatWithEmoji(guildId, 'tactical', tac)}: ${count}/3**`;
        }).join('\n'),
      footer: { text: 'Select from the dropdowns below' },
      image: {
        url: 'https://media.discordapp.net/attachments/1413190110694084789/1430281339231277066/bwDlFcd.png?ex=68f9dd8c&is=68f88c0c&hm=07f8d5ab727cce9b9122a8a17ecbc9dd53425a229cb9f666ad05dd112221194d&=&format=png&quality=lossless&width=400&height=63'
      },
    };

    const lethalOptions = LETHAL_EQUIPMENT.map((lethal) => {
      const labelWithEmoji = this.botService.formatWithEmoji(guildId, 'lethal', lethal);
      return {
        label: this.truncateLabel(labelWithEmoji),
        value: lethal,
      };
    });

    const tacticalOptions = TACTICAL_EQUIPMENT.map((tactical) => {
      const count = this.botService.getTacticalCount(setup, tactical);
      const labelWithEmoji = this.botService.formatWithEmoji(guildId, 'tactical', tactical);
      const description = `${count}/3 used`;
      
      return {
        label: this.truncateLabel(labelWithEmoji),
        value: tactical,
        description: this.truncateLabel(description, 100),
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
