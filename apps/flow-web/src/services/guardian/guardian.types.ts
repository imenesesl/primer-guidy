export enum ChatRole {
  User = 'user',
  Assistant = 'assistant',
}

export interface ChatTurn {
  readonly role: ChatRole
  readonly content: string
}

export interface SendChatArgs {
  readonly prompt: string
  readonly context: string
  readonly history?: readonly ChatTurn[]
  readonly authToken: string
}

export interface ChatResponse {
  readonly reply: string
  readonly model: string
}
