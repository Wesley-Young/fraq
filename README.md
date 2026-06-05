# Fraq

面向 Milky 协议的 TypeScript 聊天机器人框架

[![npm version badge](https://img.shields.io/npm/v/@fraqjs%2Ffraq?style=flat-square)](https://www.npmjs.com/package/@fraqjs/fraq)

## Features

### 类型安全的指令路由

用声明式的参数定义机器人指令，利用 TypeScript 自动推断用户输入和处理函数的类型。

```typescript
ctx.command(
  "foo",
  {
    bar: param.str(),
    baz: param.num(),
  },
  (session, { bar, baz }) => {
    // bar: string, baz: number
  },
);
```

### 直观的消息构建

内置模板表情字符串支持，用自然的方式组合文本、表情、图片等消息段，减少样板代码。

```typescript
session.reply(msg`
The answer to Life, the ${seg.image("http://example.com/universe.png")}
and Everything is ${seg.face(42)}!
`);
```

### 可组合的插件架构

将指令、事件处理器和共享服务封装成插件，由框架统一加载和管理，方便复用、组合和扩展。

```typescript
definePlugin({
  name: "alpha-consumer",
  inject: {
    alpha: AlphaService,
  },
  apply(ctx) {
    // ctx.alpha: AlphaService
    ctx.logger.info(`Alpha value: ${ctx.alpha.value}`);
  },
});
```

### 统一的上下文模型

通过统一的 Context 管理连接、路由、插件和运行状态，支持 fork 和过滤等高阶功能。

```typescript
const ctx = Context.fromUrl("https://your-service.com/");
ctx.fork("Group A", filter.group(123456789)).install(PluginA);
ctx.fork("Group B", filter.group(987654321)).install(PluginB);
```

## Documentation

前往[官方文档](https://fraq.ntqqrev.org)查看详细的使用指南。

## See Also

- [Fraq | owl＊tree feat. べんざ](https://www.youtube.com/watch?v=NXc5t41G6-I)
