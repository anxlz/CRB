import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext, Options, ChannelOption } from 'necord';
import { Channel } from 'discord.js';
import { BotService } from '../bot.service';
import { EMBED_COLOR } from '../../constants/game-data';

class SetLogChannelDto {
  @ChannelOption({
    name: 'channel',
    description: 'Channel to send roster logs',
    required: true,
  })
  channel: Channel;
}

@Injectable()
export class SetLogChannelCommand {
  constructor(private readonly botService: BotService) {}

  @SlashCommand({
    name: 'setlogchannel',
    description: 'Set the channel where roster logs will be sent',
  })
  async onSetLogChannel(
    @Context() [interaction]: SlashCommandContext,
    @Options() { channel }: SetLogChannelDto,
  ) {
    const guildId = interaction.guildId;
    if (!guildId) {
      return interaction.reply({
        content: 'This command can only be used in a server!',
        ephemeral: true,
      });
    }

    this.botService.setLogChannel(guildId, channel.id);

    const embed = {
      color: EMBED_COLOR,
      title: '**Log Channel Set**',
      description: `**${channel} has been set as the roster log channel.**`,
      image: {
        url: 'https://media.discordapp.net/attachments/1413190110694084789/1430281339231277066/bwDlFcd.png?ex=68f9dd8c&is=68f88c0c&hm=07f8d5ab727cce9b9122a8a17ecbc9dd53425a229cb9f666ad05dd112221194d&=&format=png&quality=lossless&width=400&height=63'
      },
    };

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
