export interface IHostingProvider {
  getProjectUrl(): string
  getPreviewUrl(channelId: string): string
}
