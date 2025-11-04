import { NumberOption, StringOption } from 'necord';

export class RoomCreateOptionsDto {
  @NumberOption({
    name: 'game_id',
    description: 'The ID of the game',
    required: true,
    min_value: 1,
  })
  gameId: number;

  @StringOption({
    name: 'room_code',
    description: 'Room code or link for joining (e.g., game code, Discord link)',
    required: true,
    max_length: 100,
  })
  roomCode?: string;

  @NumberOption({
    name: 'max_players',
    description: 'Maximum number of players allowed',
    required: true,
    min_value: 1,
    max_value: 100,
  })
  maxPlayers?: number;

  @NumberOption({
    name: 'min_players',
    description: 'Minimum number of players required',
    required: false,
    min_value: 1,
    max_value: 100,
  })
  minPlayers?: number;

  @StringOption({
    name: 'type_play',
    description: 'Type of gameplay',
    required: false,
    choices: [
      { name: 'Casual', value: 'casual' },
      { name: 'Competitive', value: 'competitive' },
      { name: 'Custom', value: 'custom' },
      { name: 'Tournament', value: 'tournament' },
    ],
  })
  typePlay?: 'casual' | 'competitive' | 'custom' | 'tournament';

  @StringOption({
    name: 'room_type',
    description: 'Room visibility type',
    required: false,
    choices: [
      { name: 'Public', value: 'public' },
      { name: 'Private', value: 'private' },
    ],
  })
  roomType?: 'public' | 'private';

  @StringOption({
    name: 'scheduled_at',
    description: 'Scheduled date/time (ISO format: YYYY-MM-DDTHH:mm:ssZ)',
    required: false,
  })
  scheduledAt?: string;
}
