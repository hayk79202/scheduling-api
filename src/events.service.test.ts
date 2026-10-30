import 'reflect-metadata';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { EventsService } from './events.service';

test('events persist, reload, reject overlaps, and delete', () => {
  const directory = mkdtempSync(join(tmpdir(), 'scheduling-api-'));
  const previous = process.env.SCHEDULING_DATA_FILE;
  process.env.SCHEDULING_DATA_FILE = join(directory, 'events.json');
  try {
    const service = new EventsService();
    const event = service.create({
      title: 'Design review',
      startsAt: '2026-11-01T10:00:00.000Z',
      endsAt: '2026-11-01T11:00:00.000Z',
    });
    assert.equal(service.get(event.id).title, 'Design review');
    assert.equal(new EventsService().list().length, 1);
    assert.throws(() => service.create({
      title: 'Conflict',
      startsAt: '2026-11-01T10:30:00.000Z',
      endsAt: '2026-11-01T11:30:00.000Z',
    }), ConflictException);
    assert.throws(() => service.create({
      title: 'Invalid',
      startsAt: '2026-11-01T11:00:00.000Z',
      endsAt: '2026-11-01T10:00:00.000Z',
    }), BadRequestException);
    service.remove(event.id);
    assert.equal(new EventsService().list().length, 0);
  } finally {
    if (previous === undefined) delete process.env.SCHEDULING_DATA_FILE;
    else process.env.SCHEDULING_DATA_FILE = previous;
    rmSync(directory, { recursive: true, force: true });
  }
});
