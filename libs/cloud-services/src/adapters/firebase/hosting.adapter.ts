import type { IHostingProvider } from '../../ports/hosting.port'
import type { HostingConfig } from '../../ports/hosting.types'

export class FirebaseHostingAdapter implements IHostingProvider {
  private readonly config: HostingConfig

  constructor(config: HostingConfig) {
    this.config = config
  }

  getProjectUrl(): string {
    const site = this.config.site ?? this.config.projectId
    return `https://${site}.web.app`
  }

  getPreviewUrl(channelId: string): string {
    const site = this.config.site ?? this.config.projectId
    return `https://${site}--${channelId}.web.app`
  }
}
