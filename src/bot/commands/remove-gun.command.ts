import { Injectable, UseInterceptors } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext, Options, StringOption, AutocompleteInterceptor } from 'necord';
import { AutocompleteInteraction } from 'discord.js';
import { CustomGunsService } from '../custom-guns.service';
import { EMBED_COLOR } from '../../constants/game-data';

class RemoveGunDto {
  @StringOption({
    name: 'category',
    description: 'Category of the gun to remove',
    required: true,
    autocomplete: true,
  })
  category: string;

  @StringOption({
    name: 'gun_name',
    description: 'Name of the gun to remove',
    required: true,
    autocomplete: true,
  })
  gunName: string;
}

@Injectable()
export class RemoveGunAutocompleteInterceptor extends AutocompleteInterceptor {
  constructor(private readonly customGunsService: CustomGunsService) {
    super();
  }

  public async transformOptions(interaction: AutocompleteInteraction) {
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

    if (focused.name === 'gun_name') {
      const category = interaction.options.getString('category');
      const guildId = interaction.guildId;
      
      if (category && guildId) {
        const guns = this.customGunsService.getGunsByCategory(guildId, category);
        const searchValue = focused.value.toString().toLowerCase();
        
        const filtered = searchValue === ''
          ? guns
          : guns.filter(g => g.name.toLowerCase().includes(searchValue));

        return interaction.respond(
          filtered.slice(0, 25).map(g => ({ name: g.name, value: g.name }))
        );
      }
    }
    
    return interaction.respond([]);
  }
}

@Injectable()
export class RemoveGunCommand {
  constructor(private readonly customGunsService: CustomGunsService) {}

  @UseInterceptors(RemoveGunAutocompleteInterceptor)
  @SlashCommand({
    name: 'removegun',
    description: 'Remove a custom gun from a category',
  })
  async onRemoveGun(
    @Context() [interaction]: SlashCommandContext,
    @Options() options: RemoveGunDto,
  ) {
    const guildId = interaction.guildId;
    if (!guildId) {
      return interaction.reply({
        content: 'This command can only be used in a server!',
        ephemeral: true,
      });
    }

    const normalizedCategory = options.category.toUpperCase();
    
    if (!this.customGunsService.gunExists(guildId, normalizedCategory, options.gunName)) {
      return interaction.reply({
        content: `❌ Gun **${options.gunName}** not found in category **${normalizedCategory}**!`,
        ephemeral: true,
      });
    }

    const success = this.customGunsService.removeGun(guildId, normalizedCategory, options.gunName);

    if (success) {
      const embed = {
        color: EMBED_COLOR,
        title: '**✅ Gun Removed Successfully**',
        description: `**Gun:** ${options.gunName}\n**Category:** ${normalizedCategory}`,
        timestamp: new Date().toISOString(),
        image: {
          url: 'https://media.discordapp.net/attachments/1413190110694084789/1430281339231277066/bwDlFcd.png?ex=68f9dd8c&is=68f88c0c&hm=07f8d5ab727cce9b9122a8a17ecbc9dd53425a229cb9f666ad05dd112221194d&=&format=png&quality=lossless&width=400&height=63'
        },
      };

      return interaction.reply({ embeds: [embed], ephemeral: false });
    } else {
      return interaction.reply({
        content: '❌ Failed to remove gun. Please try again.',
        ephemeral: true,
      });
    }
  }
}
