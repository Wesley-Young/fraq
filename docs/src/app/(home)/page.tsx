import { Card, Cards } from 'fumadocs-ui/components/card';
import {
  BookOpenIcon,
  BracesIcon,
  MessageSquareIcon,
  PuzzleIcon,
  RouteIcon,
  SquareArrowOutUpRightIcon,
  TerminalIcon,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { docsRoute, gitConfig } from '@/lib/shared';

export const metadata: Metadata = {
  title: 'Fraq',
  description: 'TypeScript Milky 聊天机器人框架',
};

export default function HomePage() {
  return (
    <main className="w-full">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16 md:py-24">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-semibold tracking-normal text-fd-foreground md:text-7xl">Fraq</h1>
          <p className="mt-5 text-lg text-fd-muted-foreground md:text-xl">
            面向 Milky 协议的 TypeScript 聊天机器人框架
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href={docsRoute} className={cn(buttonVariants({ color: 'primary' }), 'gap-2 px-4 py-2')}>
            <BookOpenIcon className="size-4" />
            阅读文档
          </Link>
          <Link
            href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
            className={cn(buttonVariants({ color: 'outline' }), 'gap-2 px-4 py-2')}
          >
            <SquareArrowOutUpRightIcon className="size-4" />
            GitHub
          </Link>
        </div>

        <div className="w-full max-w-xl overflow-hidden rounded-lg border bg-fd-card text-fd-card-foreground">
          <div className="flex items-center gap-2 border-b bg-fd-muted/40 px-4 py-2 text-sm text-fd-muted-foreground">
            <TerminalIcon className="size-4" />
            install
          </div>
          <pre className="overflow-x-auto px-4 py-4 text-sm">
            <code>npm i @fraqjs/fraq</code>
          </pre>
        </div>

        <Cards className="grid-cols-1 md:grid-cols-2">
          <Card icon={<RouteIcon />} title="类型安全的指令路由">
            用声明式的参数定义机器人指令，利用 TypeScript 自动推断用户输入和处理函数的类型。
          </Card>
          <Card icon={<MessageSquareIcon />} title="直观的消息构建">
            内置模板表情字符串支持，用自然的方式组合文本、表情、图片等消息段，减少样板代码。
          </Card>
          <Card icon={<PuzzleIcon />} title="可组合的插件架构">
            将指令、事件处理器和共享服务封装成插件，由框架统一加载和管理，方便复用、组合和扩展。
          </Card>
          <Card icon={<BracesIcon />} title="统一的上下文模型">
            通过统一的 Context 管理连接、路由、插件和运行状态，支持 fork 和过滤等高阶功能。
          </Card>
        </Cards>
      </section>
    </main>
  );
}
