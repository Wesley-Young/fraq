import type { Renderer, RenderOptions } from '@takumi-rs/core';
import { createElement } from 'react';

import { TakumiService } from '../src';

import assert from 'node:assert/strict';
import test from 'node:test';

type RenderCall = {
  source: unknown;
  options?: RenderOptions;
  signal?: AbortSignal;
};

function createRendererDouble() {
  const calls: RenderCall[] = [];
  const output = Buffer.from('rendered');
  const renderer = {
    async render(source: unknown, options?: RenderOptions, signal?: AbortSignal) {
      calls.push({ source, options, signal });
      return output;
    },
  } as unknown as Renderer;

  return { renderer, calls, output };
}

test('renderHtml forwards helper output, render options, and the shared abort signal', async () => {
  const { renderer, calls, output } = createRendererDouble();
  const service = new TakumiService(renderer);

  const result = await service.renderHtml('<div style="width: 24px; height: 24px;"></div>', {
    width: 24,
    height: 24,
    format: 'png',
    stylesheets: ['.extra { color: red; }'],
  });

  assert.equal(result, output);
  assert.equal(calls.length, 1);
  assert.ok(calls[0]?.source);
  assert.equal(calls[0]?.options?.width, 24);
  assert.equal(calls[0]?.options?.height, 24);
  assert.equal(calls[0]?.options?.format, 'png');
  assert.ok(Array.isArray(calls[0]?.options?.stylesheets));
  assert.ok((calls[0]?.options?.stylesheets?.length ?? 0) >= 1);
  assert.ok(calls[0]?.options?.stylesheets?.includes('.extra { color: red; }'));
  assert.equal(calls[0]?.signal?.aborted, false);
});

test('renderJsx forwards helper output, render options, and the shared abort signal', async () => {
  const { renderer, calls, output } = createRendererDouble();
  const service = new TakumiService(renderer);

  const result = await service.renderJsx(createElement('div', { tw: 'flex text-red-500' }, 'hello'), {
    height: 120,
    devicePixelRatio: 2,
    stylesheets: ['.manual { display: block; }'],
  });

  assert.equal(result, output);
  assert.equal(calls.length, 1);
  assert.ok(calls[0]?.source);
  assert.equal(calls[0]?.options?.height, 120);
  assert.equal(calls[0]?.options?.devicePixelRatio, 2);
  assert.ok((calls[0]?.options?.stylesheets?.length ?? 0) > 0);
  assert.ok(calls[0]?.options?.stylesheets?.includes('.manual { display: block; }'));
  assert.equal(calls[0]?.signal?.aborted, false);
});

test('dispose aborts the shared signal used by subsequent renders', async () => {
  const { renderer, calls } = createRendererDouble();
  const service = new TakumiService(renderer);

  await service.renderHtml('<div></div>');

  const signal = calls[0]?.signal;

  assert.ok(signal);
  assert.equal(signal.aborted, false);

  service.dispose();

  assert.equal(signal.aborted, true);
});
