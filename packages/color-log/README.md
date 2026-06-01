# Fraq Color Log

Fraq Color Log provides a colored console log handler for Fraq.

## Installation

```bash
npm install @fraqjs/fraq @fraqjs/color-log
# or
yarn add @fraqjs/fraq @fraqjs/color-log
# or
pnpm add @fraqjs/fraq @fraqjs/color-log
```

## Usage

```typescript
import { Context } from '@fraqjs/fraq';
import { createColorLogHandler } from '@fraqjs/color-log';

const ctx = Context.fromUrl('<your Milky endpoint>', {
  logHandler: createColorLogHandler(),
});

ctx.start();
```
