import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

import { version } from '../../../packages/core/package.json';
import { appName, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // JSX supported
      title: (
        <span className="flex items-center gap-1">
          {appName}
          <span className="inline-block whitespace-nowrap rounded-full bg-black px-[0.4rem] py-[0.15rem] font-mono text-[0.75em] leading-none text-white dark:bg-white dark:text-black">
            v{version}
          </span>
        </span>
      ),
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
