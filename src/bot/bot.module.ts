import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { SetupChannelsCommand } from './commands/setup-channels.command';
import { ResetSetupCommand } from './commands/reset-setup.command';
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
    RoleInteractionHandler,
    WeaponInteractionHandler,
    OperatorInteractionHandler,
    EquipmentInteractionHandler,
    MapInteractionHandler,
    ActionButtonHandler,
  ],
})
export class BotModule {}
