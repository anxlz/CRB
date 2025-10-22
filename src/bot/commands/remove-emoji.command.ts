import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext, Options, StringOption } from 'necord';
import { BotService } from '../bot.service';
import { EMBED_COLOR, WEAPONS, OPERATOR_SKILLS, LETHAL_EQUIPMENT, TACTICAL_EQUIPMENT, WeaponClassRole } from '../../constants/game-data';

class RemoveEmojiDto {
  @StringOption({
    name: 'category',
    description: 'Category (role, weapon, operator, lethal, tactical)',
    required: true,
    choices: [
      { name: 'Role', value: 'role' },
      { name: 'Weapon', value: 'weapon' },
      { name: 'Operator', value: 'operator' },
      { name: 'Lethal', value: 'lethal' },
      { name: 'Tactical', value: 'tactical' },
    ],
  })
  category: string;

  @StringOption({
    name: 'item',
    description: 'The item name to remove emoji from (e.g., AR, M13, War Machine, etc.)',
    required: true,
  })
  item: string;
}

@Injectable()
export class RemoveEmojiCommand {
  constructor(private readonly botService: BotService) {}

  @SlashCommand({
    name: 'removeemoji',
    description: 'Remove custom emoji from guns, roles, operators, and equipment',
  })
  async onRemoveEmoji(
    @Context() [interaction]: SlashCommandContext,
    @Options() { category, item }: RemoveEmojiDto,
  ) {
    const guildId = interaction.guildId;
    if (!guildId) {
      return interaction.reply({
        content: 'This command can only be used in a server!',
        ephemeral: true,
      });
    }

    const existingEmoji = this.botService.getCustomEmoji(guildId, category, item);
    
    if (!existingEmoji) {
      return interaction.reply({
        content: `❌ No custom emoji found for **${item}** in category **${category}**`,
        ephemeral: true,
      });
    }

    this.botService.removeCustomEmoji(guildId, category, item);

    const embed = {
      color: EMBED_COLOR,
      title: '**✅ Custom Emoji Removed**',
      description: `**Successfully removed emoji for **${item}** in category **${category}****\n\n**Removed emoji: ${existingEmoji}**`,
      fields: [
        {
          name: '**Category**',
          value: `**${category}**`,
          inline: true,
        },
        {
          name: '**Item**',
          value: `**${item}**`,
          inline: true,
        },
      ],
      image: {
        url: 'https://media.discordapp.net/attachments/1413190110694084789/1430281339231277066/bwDlFcd.png?ex=68f9dd8c&is=68f88c0c&hm=07f8d5ab727cce9b9122a8a17ecbc9dd53425a229cb9f666ad05dd112221194d&=&format=png&quality=lossless&width=400&height=63'
      },
    };

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
