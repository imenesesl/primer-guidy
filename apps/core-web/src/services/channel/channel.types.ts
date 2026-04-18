export interface ChannelData {
  readonly name: string
  readonly active: boolean
  readonly students: readonly string[]
}

export interface ChannelDocument extends ChannelData {
  readonly id: string
}
