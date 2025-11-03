import { NumberOption, StringOption } from 'necord';

export class GamesListOptionsDto {
  @NumberOption({
    name: 'page',
    description: 'Page number',
    required: false,
    min_value: 1,
  })
  page?: number;

  @StringOption({
    name: 'search',
    description: 'Search games by title',
    required: false,
  })
  search?: string;

  @StringOption({
    name: 'genre',
    description: 'Filter by genre',
    required: false,
  })
  genre?: string;

  @StringOption({
    name: 'platform',
    description: 'Filter by platform',
    required: false,
  })
  platform?: string;
}
