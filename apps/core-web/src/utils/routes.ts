export const CoreRoutes = {
  Home: '/',
  Directories: '/directories',
  DirectoriesUsers: '/directories/users',
  Channels: '/channels',
  Activity: '/activity',
  ActivityNotifications: '/activity/notifications',
  ActivityHistory: '/activity/history',
} as const

export const buildChannelContentPath = (channelId: string): string =>
  `/channels/${channelId}/content`

export const buildChannelAiPath = (channelId: string): string => `/channels/${channelId}/ai`
