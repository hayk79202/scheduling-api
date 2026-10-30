import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateEventDto } from './events.dto';

export type Event = { id: string; title: string; startsAt: string };

@Injectable()
export class EventsService {
  private readonly events = new Map<string, Event>();

  list(): Event[] {
    return [...this.events.values()].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }

  create(input: CreateEventDto): Event {
    const event = { id: randomUUID(), title: input.title.trim(), startsAt: input.startsAt };
    this.events.set(event.id, event);
    return event;
  }

  get(id: string): Event {
    const event = this.events.get(id);
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  remove(id: string): void {
    if (!this.events.delete(id)) throw new NotFoundException('Event not found');
  }
}
