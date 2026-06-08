import { Context } from '@fraqjs/fraq';
import { createMockMilkyClient } from '@fraqjs/mock';

import { TakumiService } from '../src';

import fs from 'node:fs/promises';
import { createRequire } from 'node:module';

type CardProps = {
  title: string;
  author: string;
};

function Card({ title, author }: CardProps) {
  return (
    <div tw="flex flex-col justify-center w-full h-full px-5 bg-white text-gray-900">
      <h1 tw="font-bold" style={{ fontFamily: 'Roboto' }}>
        {title}
      </h1>
      <p style={{ fontFamily: 'Inter' }}>{author}</p>
      <p tw="text-gray-500" style={{ fontFamily: 'Noto Sans SC' }}>
        由 @fraqjs/plugin-takumi 渲染. 它内置了 <b>Noto Sans SC 字体</b>.
      </p>
    </div>
  );
}

const ctx = Context.fromClient(createMockMilkyClient());
const service = new TakumiService(ctx, {});

const require = createRequire(import.meta.url);

await service.registerFontFamily('Roboto', [
  require.resolve('@fontsource-variable/roboto/files/roboto-latin-standard-normal.woff2'),
]);
await service.registerFontFamily('Inter', [
  require.resolve('@fontsource-variable/inter/files/inter-latin-standard-normal.woff2'),
]);
await service.registerFontFamily('Noto Sans SC', [require.resolve('../fonts/NotoSansSC-VariableFont_wght.ttf')]);

const buffer = await service.renderJsx(<Card title="The Great Gatsby" author="F. Scott Fitzgerald" />, {
  devicePixelRatio: 2.0,
});

await fs.writeFile('card.png', buffer);
