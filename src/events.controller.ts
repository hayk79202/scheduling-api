import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { CreateEventDto } from './events.dto';
import { EventsService } from './events.service';

@Controller()
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get('health')
  health() { return { status: 'ok' }; }

  @Get('events')
  list() { return this.events.list(); }

  @Post('events')
  create(@Body() input: CreateEventDto) { return this.events.create(input); }

  @Get('events/:id')
  get(@Param('id') id: string) { return this.events.get(id); }

  @Delete('events/:id')
  @HttpCode(204)
  remove(@Param('id') id: string) { this.events.remove(id); }
}
