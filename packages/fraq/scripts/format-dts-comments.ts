import { readFileSync, writeFileSync } from 'node:fs';

const files = process.argv.slice(2);

if (files.length === 0) {
  files.push('dist/index.d.mts');
}

for (const file of files) {
  const source = readFileSync(file, 'utf8');
  const formatted = formatDtsComments(source);

  if (formatted !== source) {
    writeFileSync(file, formatted);
  }

  console.log(`Formatted comments in ${file}.`);
}

function formatDtsComments(source: string): string {
  const lines = source.split('\n').flatMap((line) => splitInlineJSDoc(line));

  return removeAdjacentDuplicateJSDoc(lines).join('\n');
}

function removeAdjacentDuplicateJSDoc(lines: string[]): string[] {
  const result: string[] = [];

  for (const line of lines) {
    const previous = result.at(-1);

    if (previous?.trim() === line.trim() && isSingleLineJSDoc(line)) {
      continue;
    }

    result.push(line);
  }

  return result;
}

function isSingleLineJSDoc(line: string): boolean {
  return /^\/\*\*.*\*\/$/.test(line.trim());
}

function splitInlineJSDoc(line: string): string[] {
  // biome-ignore lint/correctness/noEmptyCharacterClassInRegex: This regex is intentionally designed to match the first JSDoc comment in the line, regardless of its content.
  const match = /\/\*\*[^]*?\*\//.exec(line);

  if (!match) {
    return [line];
  }

  const comment = match[0];
  const commentStart = match.index;
  const commentEnd = commentStart + comment.length;
  const indent = line.match(/^\s*/)?.[0] ?? '';
  const before = line.slice(0, commentStart);
  const after = line.slice(commentEnd);

  if (before.trim() === '') {
    const remaining = after.trimStart();

    if (remaining === '') {
      return [line];
    }

    return [indent + comment, ...splitInlineJSDoc(indent + remaining)];
  }

  const trailing = after.trim();
  const statementEnd = trailing.match(/^[;,]/)?.[0] ?? '';
  const remaining = statementEnd ? trailing.slice(statementEnd.length).trimStart() : trailing;
  const result = [before.trimEnd() + statementEnd, indent + comment];

  if (remaining !== '') {
    result.push(...splitInlineJSDoc(indent + remaining));
  }

  return result;
}
