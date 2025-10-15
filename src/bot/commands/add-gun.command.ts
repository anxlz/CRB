import { Injectable, UseInterceptors } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext, Options, StringOption, AutocompleteInterceptor } from 'necord';
import { AutocompleteInteraction } from 'discord.js';
import { CustomGunsService } from '../custom-guns.service';
import { EMBED_COLOR } from '../../constants/game-data';

class AddGunDto {
  @StringOption({
    name: 'category',
    description: 'Gun category (AR, SMG, Heavy, Marksman)',
    required: true,
    autocomplete: true,
  })
  category: string;

  @StringOption({
    name: 'gun_name',
    description: 'Name of the gun to add (e.g., Type 25)',
    required: true,
  })
  gunName: string;
}

@Injectable()
export class CategoryAutocompleteInterceptor extends AutocompleteInterceptor {
  public transformOptions(interaction: AutocompleteInteraction) {
    const focused = interaction.options.getFocused(true);
    const categories = [
      { name: 'AR', value: 'AR' },
      { name: 'SMG', value: 'SMG' },
      { name: 'Heavy', value: 'HEAVY' },
      { name: 'Marksman', value: 'MARKSMAN' }
    ];
    
    if (focused.name === 'category') {
      const searchValue = focused.value.toString().toLowerCase();
      const filtered = searchValue === '' 
        ? categories 
        : categories.filter(cat => cat.name.toLowerCase().includes(searchValue));
      
      return interaction.respond(filtered.slice(0, 25));
    }
    
    return interaction.respond([]);
  }
}

@Injectable()
export class AddGunCommand {
  constructor(private readonly customGunsService: CustomGunsService) {}

  @UseInterceptors(CategoryAutocompleteInterceptor)
  @SlashCommand({
    name: 'addgun',
    description: 'Add a custom gun to a category',
  })
  async onAddGun(
    @Context() [interaction]: SlashCommandContext,
    @Options() options: AddGunDto,
  ) {
    const guildId = interaction.guildId;
    if (!guildId) {
      return interaction.reply({
        content: 'This command can only be used in a server!',
        ephemeral: true,
      });
    }

    const userId = interaction.user.id;
    const normalizedCategory = options.category.toUpperCase();
    
    const validCategories = ['AR', 'SMG', 'HEAVY', 'MARKSMAN'];
    if (!validCategories.includes(normalizedCategory)) {
      return interaction.reply({
        content: `❌ Invalid category! Valid categories are: ${validCategories.join(', ')}`,
        ephemeral: true,
      });
    }

    if (this.customGunsService.gunExists(guildId, normalizedCategory, options.gunName)) {
      return interaction.reply({
        content: `❌ Gun **${options.gunName}** already exists in category **${normalizedCategory}**!`,
        ephemeral: true,
      });
    }

    const success = this.customGunsService.addGun(guildId, normalizedCategory, options.gunName, userId);

    if (success) {
      const embed = {
        color: EMBED_COLOR,
        title: '✅ Gun Added Successfully',
        description: `**Gun:** ${options.gunName}\n**Category:** ${normalizedCategory}\n**Added by:** <@${userId}>`,
        timestamp: new Date().toISOString(),
      };

      return interaction.reply({ embeds: [embed], ephemeral: false });
    } else {
      return interaction.reply({
        content: '❌ Failed to add gun. Please try again.',
        ephemeral: true,
      });
    }
  }
}
