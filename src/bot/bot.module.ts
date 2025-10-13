import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { SetupChannelsCommand } from './commands/setup-channels.command';
import { ResetSetupCommand } from './commands/reset-setup.command';
import { SetLogChannelCommand } from './commands/set-log-channel.command';
import { SetManagerRoleCommand } from './commands/set-manager-role.command';
import { TestModeCommand } from './commands/test-mode.command';
import { PlayerProfileCommand } from './commands/player-profile.command';
import { SendSetupCommand } from './commands/send-setup.command';
import { SetEmojiCommand } from './commands/set-emoji.command';
import { SetGunsMenuCommand } from './commands/set-guns-menu.command';
import { BotUpdate } from './bot.update';
import { RoleInteractionHandler } from './interactions/role-interaction.handler';
import { WeaponInteractionHandler } from './interactions/weapon-interaction.handler';
import { OperatorInteractionHandler } from './interactions/operator-interaction.handler';
import { EquipmentInteractionHandler } from './interactions/equipment-interaction.handler';
import { MapInteractionHandler } from './interactions/map-interaction.handler';
import { ActionButtonHandler } from './interactions/action-button.handler';

@Module({
  providers: [
    BotService,
    BotUpdate,
    SetupChannelsCommand,
    ResetSetupCommand,
    SetLogChannelCommand,
    SetManagerRoleCommand,
    TestModeCommand,
    PlayerProfileCommand,
    SendSetupCommand,
    SetEmojiCommand,
    SetGunsMenuCommand,
    RoleInteractionHandler,
    WeaponInteractionHandler,
    OperatorInteractionHandler,
    EquipmentInteractionHandler,
    MapInteractionHandler,
    ActionButtonHandler,
  ],
})
export class BotModule {}
