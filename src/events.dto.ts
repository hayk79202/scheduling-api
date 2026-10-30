import { IsDateString, IsString, Matches } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @Matches(/\S/, { message: 'title must contain visible text' })
  title!: string;

  @IsDateString()
  startsAt!: string;

  @IsDateString()
  endsAt!: string;
}
