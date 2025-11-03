import { NumberOption } from 'necord';

export class GameDetailOptionsDto {
  @NumberOption({
    name: 'id',
    description: 'Game ID',
    required: true,
    min_value: 1,
  })
  id: number;
}
