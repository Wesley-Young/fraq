# Agent Notes

## Testing

Prefer narrow, direct commands that avoid triggering pnpm's package-script dependency checks.

For core service/plugin behavior, run the target test file directly. For example, to test `service`:

```bash
pnpm exec tsx --test packages/core/test/service.test.ts
```

This is lower impact than:

```bash
pnpm --filter @fraqjs/fraq test
```

The filtered package script can trigger pnpm install/status checks, including `node_modules` recreation prompts and registry access. Use the direct `tsx --test` form when a focused test file is enough.

For type checking without build output, for example to check `core`:

```bash
pnpm exec tsc -p packages/core/tsconfig.json --noEmit
```

For Biome checks, scope the command to changed files, for example:

```bash
pnpm exec biome check packages/core/src/core/context.ts packages/core/src/core/plugin.ts packages/core/test/service.test.ts
```

Adjust the file list to match the current change. Avoid broad checks unless the change genuinely needs them.
