import type { ComponentProps } from 'react';

import { cn } from '@/lib/cn';

export interface NpmBadgeProps extends ComponentProps<'a'> {
  packageName: string;
}

export function NpmBadge({ packageName, className, ...props }: NpmBadgeProps) {
  const encodedPackageName = encodeURIComponent(packageName);

  return (
    <a
      href={`https://www.npmjs.com/package/${packageName}`}
      rel="noreferrer noopener"
      target="_blank"
      {...props}
      className={cn('not-prose inline-flex w-fit items-center align-middle', className)}
    >
      {/** biome-ignore lint/performance/noImgElement: The image is simple and doesn't require optimization */}
      <img
        alt={`${packageName} npm version`}
        className="block h-5 w-auto max-w-none"
        src={`https://img.shields.io/npm/v/${encodedPackageName}?style=flat-square`}
      />
    </a>
  );
}
