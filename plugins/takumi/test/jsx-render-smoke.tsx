import { Renderer } from '@takumi-rs/core';

import { TakumiService } from '../src';

import fs from 'node:fs/promises';

type CardProps = {
  title: string;
  author: string;
};

function Card({ title, author }: CardProps) {
  return (
    <div tw="flex flex-col justify-center w-full h-full px-5 bg-white text-gray-900">
      <h1 tw="font-bold">{title}</h1>
      <p tw="text-gray-500">{author}</p>
    </div>
  );
}

const service = new TakumiService(new Renderer());
const buffer = await service.renderJsx(<Card title="The Great Gatsby" author="F. Scott Fitzgerald" />);

await fs.writeFile('card.png', buffer);
