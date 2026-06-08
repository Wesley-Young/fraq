import { definePlugin } from '@fraqjs/fraq';

import { ConversationService, type ConversationServiceOptions } from './service';

export const ConversationPlugin = definePlugin({
  name: 'conversation',
  provides: [ConversationService],
  apply(ctx, options?: ConversationServiceOptions) {
    ctx.provide(ConversationService, new ConversationService(ctx, options));
  },
});

export * from './error';
export * from './service';

export default ConversationPlugin;
