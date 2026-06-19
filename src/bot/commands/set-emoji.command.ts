import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext, Options, StringOption } from 'necord';
import { BotService } from '../bot.service';
import { EMBED_COLOR, WEAPONS, OPERATOR_SKILLS, LETHAL_EQUIPMENT, TACTICAL_EQUIPMENT, WeaponClassRole } from '../../constants/game-data';

class SetEmojiDto {
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
    description: 'The item name (e.g., AR, M13, War Machine, etc.)',
    required: true,
  })
  item: string;

  @StringOption({
    name: 'emoji',
    description: 'The custom emoji to use (e.g., :emoji_name: or <:emoji_name:id>)',
    required: true,
  })
  emoji: string;
}

@Injectable()
export class SetEmojiCommand {
  constructor(private readonly botService: BotService) {}

  @SlashCommand({
    name: 'setemoji',
    description: 'Set custom emoji for guns, roles, operators, and equipment',
  })
  async onSetEmoji(
    @Context() [interaction]: SlashCommandContext,
    @Options() { category, item, emoji }: SetEmojiDto,
  ) {
    const guildId = interaction.guildId;
    if (!guildId) {
      return interaction.reply({
        content: 'This command can only be used in a server!',
        ephemeral: true,
      });
    }

    // Validate the item based on category
    let validItems: string[] = [];
    switch (category) {
      case 'role':
        validItems = ['AR', 'SMG', 'LMG', 'Shotgun', 'Marksman', 'Sniper'];
        break;
      case 'weapon':
        validItems = [
          ...WEAPONS[WeaponClassRole.AR],
          ...WEAPONS[WeaponClassRole.SMG],
          ...WEAPONS[WeaponClassRole.LMG],
          ...WEAPONS[WeaponClassRole.SHOTGUN],
          ...WEAPONS[WeaponClassRole.MARKSMAN],
          ...WEAPONS[WeaponClassRole.SNIPER],
        ];
        break;
      case 'operator':
        validItems = OPERATOR_SKILLS;
        break;
      case 'lethal':
        validItems = LETHAL_EQUIPMENT;
        break;
      case 'tactical':
        validItems = TACTICAL_EQUIPMENT;
        break;
    }

    if (!validItems.includes(item)) {
      return interaction.reply({
        content: `❌ Invalid item "${item}" for category "${category}".\n\nValid items: ${validItems.slice(0, 10).join(', ')}${validItems.length > 10 ? '...' : ''}`,
        ephemeral: true,
      });
    }

    // Set the custom emoji
    this.botService.setCustomEmoji(guildId, category, item, emoji);

    const embed = {
      color: EMBED_COLOR,
      title: '**✅ Custom Emoji Set**',
      description: `**Successfully set emoji for **${item}** in category **${category}****\n\n**Emoji: ${emoji}**`,
      fields: [
        { name: '**Category**', value: `**${category}**`, inline: true },
        { name: '**Item**', value: `**${item}**`, inline: true },
        { name: '**Emoji**', value: `**${emoji}**`, inline: true },
      ],
      image: {
        url: 'https://media.discordapp.net/attachments/1413190110694084789/1430281339231277066/bwDlFcd.png?ex=68f9dd8c&is=68f88c0c&hm=07f8d5ab727cce9b9122a8a17ecbc9dd53425a229cb9f666ad05dd112221194d&=&format=png&quality=lossless&width=400&height=63'
      },
    };

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
