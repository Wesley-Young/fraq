# Fraq

Fraq 是一个 [Milky](https://milky.ntqqrev.org/) 协议的聊天机器人框架，在协议之上提供了更方便的上下文、路由、消息构造、插件和服务依赖注入能力，让你可以用 TypeScript 更轻松地组织一个机器人应用。

## 安装 Fraq

可以通过任意的包管理器安装 Fraq：

```bash
npm install @fraqjs/fraq
# or
yarn add @fraqjs/fraq
# or
pnpm add @fraqjs/fraq
```

Fraq 需要在 Node.js 22+ 环境（或其他的支持 WebSocket API 的服务端 JS 环境）中运行。强烈建议使用 TypeScript 来编写 Fraq 代码，并使用 [tsx](https://www.npmjs.com/package/tsx) 来运行你的项目。

## 第一个 Fraq 机器人

我们从一个 Echo 机器人开始。首先，启动你的 Milky 协议端，并确认它监听的地址与端口。然后，在你的项目中创建一个 `index.ts` 文件，并添加以下代码：

```typescript
import { Context, msg, param } from '@fraqjs/fraq';

const ctx = Context.fromUrl('<替换成你的 Milky 协议端地址>', {
  // accessToken: '<如果你的 Milky 协议端配置了 token，请在这里添加>',
});

ctx.router.command({
  name: 'echo',
  pattern: {
    content: param.greedy(),
  },
  execute(session, { content }) {
    session.reply(msg`You said: ${content}`);
  },
});

ctx.start();
```

在一切完成之后，用 `tsx` 执行你的 `index.ts` 文件：

```bash
npx tsx index.ts
# 或 tsx index.ts, 如果你全局安装了 tsx
```

你可以在任何一个包含它的会话中发送 `echo Hello` 来测试它是否正常工作。

## 下一步

上面的例子只是 Fraq 的最小使用方式，你还可以继续了解如何构造更丰富的消息、定义更复杂的指令参数、编写可复用的插件等。

完整文档请见 [fraq.ntqqrev.org](https://fraq.ntqqrev.org/)。
