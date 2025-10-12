import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext, Options, UserOption } from 'necord';
import { User, AttachmentBuilder } from 'discord.js';
import { BotService } from '../bot.service';
import { EMBED_COLOR } from '../../constants/game-data';
import { createCanvas, loadImage } from 'canvas';

class PlayerProfileDto {
  @UserOption({
    name: 'user',
    description: 'The user to show profile for',
    required: true,
  })
  user: User;
}

@Injectable()
export class PlayerProfileCommand {
  constructor(private readonly botService: BotService) {}

  @SlashCommand({
    name: 'playerprofile',
    description: 'Show player profile with stats',
  })
  async onPlayerProfile(
    @Context() [interaction]: SlashCommandContext,
    @Options() { user }: PlayerProfileDto,
  ) {
    const guildId = interaction.guildId;
    const channelId = interaction.channelId;

    if (!guildId) {
      return interaction.reply({
        content: 'This command can only be used in a server!',
        ephemeral: true,
      });
    }

    const setup = this.botService.getSetup(guildId, channelId);
    if (!setup) {
      return interaction.reply({
        content: 'No active setup found in this channel.',
        ephemeral: true,
      });
    }

    const player = setup.players.find((p) => p.userId === user.id);
    if (!player) {
      return interaction.reply({
        content: 'This player is not in the current setup.',
        ephemeral: true,
      });
    }

    try {
      const canvas = createCanvas(800, 200);
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#8943F9';
      ctx.fillRect(0, 0, 800, 200);

      try {
        const avatarURL = user.displayAvatarURL({ extension: 'png', size: 128 });
        const avatar = await loadImage(avatarURL);
        ctx.drawImage(avatar, 20, 36, 128, 128);
      } catch (error) {
        console.error('Failed to load avatar:', error);
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px Arial';
      ctx.fillText(user.username, 170, 50);

      ctx.font = '18px Arial';
      const stats = [
        `Roles: ${player.role1 || 'N/A'} / ${player.role2 || 'N/A'}`,
        `Weapons: ${player.weapons?.join(', ') || 'N/A'}`,
        `Operator: ${player.operatorSkill || 'N/A'}`,
        `Equipment: ${player.lethal || 'N/A'} | ${player.tactical || 'N/A'}`,
      ];

      stats.forEach((stat, index) => {
        ctx.fillText(stat, 170, 85 + index * 30);
      });

      const attachment = new AttachmentBuilder(canvas.toBuffer(), {
        name: 'player-profile.png',
      });

      await interaction.reply({
        content: `Player Profile: ${user.username}`,
        files: [attachment],
      });
    } catch (error) {
      console.error('Error creating player profile:', error);
      return interaction.reply({
        content: 'Failed to create player profile image.',
        ephemeral: true,
      });
    }
  }
}
