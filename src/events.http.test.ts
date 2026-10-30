import 'reflect-metadata';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './module';

test('HTTP API validates requests and prevents overlapping events', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'scheduling-http-'));
  const previous = process.env.SCHEDULING_DATA_FILE;
  process.env.SCHEDULING_DATA_FILE = join(directory, 'events.json');
  let app: INestApplication | undefined;
  try {
    app = await NestFactory.create(AppModule, { logger: false });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.listen(0, '127.0.0.1');
    const port = app.getHttpServer().address().port as number;
    const base = `http://127.0.0.1:${port}`;
    const input = {
      title: 'Design review',
      startsAt: '2027-01-10T10:00:00.000Z',
      endsAt: '2027-01-10T11:00:00.000Z',
    };
    const send = (body: object, method = 'POST', path = '/events') => fetch(`${base}${path}`, {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });

    const created = await send(input);
    assert.equal(created.status, 201);
    const event = await created.json() as { id: string };
    assert.ok(event.id);
    assert.equal((await send({ ...input, title: '' })).status, 400);
    assert.equal((await send(input)).status, 409);

    const updated = await send({
      ...input,
      startsAt: '2027-01-10T11:00:00.000Z',
      endsAt: '2027-01-10T12:00:00.000Z',
    }, 'PUT', `/events/${event.id}`);
    assert.equal(updated.status, 200);
    const listed = await fetch(`${base}/events`);
    assert.equal((await listed.json() as unknown[]).length, 1);
  } finally {
    if (app) await app.close();
    if (previous === undefined) delete process.env.SCHEDULING_DATA_FILE;
    else process.env.SCHEDULING_DATA_FILE = previous;
    rmSync(directory, { recursive: true, force: true });
  }
});
