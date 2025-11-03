import { Module } from '@nestjs/common';
import { NecordModule } from 'necord';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IntentsBitField } from 'discord.js';
import { GameCommands, RoomCommands } from './commands';
import { GameModule } from '../core/game/game.module';
import { RoomModule } from '../core/room/room.module';

@Module({
  imports: [
    NecordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('discord.token') || '',
        intents: [
          IntentsBitField.Flags.Guilds,
          IntentsBitField.Flags.GuildMessages,
          IntentsBitField.Flags.MessageContent,
        ],
        development: configService.get<string>('discord.developmentGuildId')
          ? [configService.get<string>('discord.developmentGuildId')!]
          : false,
      }),
      inject: [ConfigService],
    }),
    GameModule,
    RoomModule,
  ],
  providers: [GameCommands, RoomCommands],
})
export class DiscordModule {}
