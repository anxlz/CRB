import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext, Options, BooleanOption } from 'necord';
import { BotService } from '../bot.service';
import { EMBED_COLOR } from '../../constants/game-data';

class TestModeDto {
  @BooleanOption({
    name: 'enabled',
    description: 'Enable or disable test mode',
    required: true,
  })
  enabled: boolean;
}

@Injectable()
export class TestModeCommand {
  constructor(private readonly botService: BotService) {}

  @SlashCommand({
    name: 'testmode',
    description: 'Enable test mode (1 player counts as 5)',
  })
  async onTestMode(
    @Context() [interaction]: SlashCommandContext,
    @Options() { enabled }: TestModeDto,
  ) {
    this.botService.setTestMode(enabled);

    const embed = {
      color: EMBED_COLOR,
      title: 'Test Mode',
      description: `Test mode has been ${enabled ? 'enabled' : 'disabled'}. ${enabled ? '1 player will count as 5 players.' : 'Normal mode restored.'}`,
    };

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
