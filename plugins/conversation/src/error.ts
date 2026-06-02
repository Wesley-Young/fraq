export class ConversationRejectionError extends Error {
  constructor(reason: string) {
    super(`Conversation rejected: ${reason}`);
    this.name = 'ConversationRejectionError';
  }
}

export class ConversationAbortionError extends Error {
  constructor() {
    super('Conversation aborted');
    this.name = 'ConversationAbortionError';
  }
}
