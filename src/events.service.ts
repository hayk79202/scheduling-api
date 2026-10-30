import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { CreateEventDto } from './events.dto';

export type Event = { id: string; title: string; startsAt: string; endsAt: string };

@Injectable()
export class EventsService {
  private readonly events = new Map<string, Event>();
  private readonly dataFile: string;

  constructor() {
    this.dataFile = process.env.SCHEDULING_DATA_FILE || join(process.cwd(), 'data', 'events.json');
    if (existsSync(this.dataFile)) {
      const saved = JSON.parse(readFileSync(this.dataFile, 'utf8')) as Event[];
      if (!Array.isArray(saved)) throw new Error('Event data must be an array');
      for (const event of saved) this.events.set(event.id, event);
    }
  }

  private persist(): void {
    mkdirSync(dirname(this.dataFile), { recursive: true });
    const temporary = `${this.dataFile}.tmp`;
    writeFileSync(temporary, JSON.stringify([...this.events.values()], null, 2));
    renameSync(temporary, this.dataFile);
  }

  list(): Event[] {
    return [...this.events.values()].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }

  create(input: CreateEventDto): Event {
    const start = Date.parse(input.startsAt);
    const end = Date.parse(input.endsAt);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      throw new BadRequestException('endsAt must be after startsAt');
    }
    const overlaps = [...this.events.values()].some(
      (event) => start < Date.parse(event.endsAt) && end > Date.parse(event.startsAt),
    );
    if (overlaps) throw new ConflictException('Time overlaps an existing event');
    const event = {
      id: randomUUID(),
      title: input.title.trim(),
      startsAt: new Date(start).toISOString(),
      endsAt: new Date(end).toISOString(),
    };
    this.events.set(event.id, event);
    this.persist();
    return event;
  }

  get(id: string): Event {
    const event = this.events.get(id);
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  remove(id: string): void {
    if (!this.events.delete(id)) throw new NotFoundException('Event not found');
    this.persist();
  }
}
