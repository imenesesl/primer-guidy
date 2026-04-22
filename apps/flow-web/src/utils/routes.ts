export const FlowRoutes = {
  Root: '/',
  Tasks: '/tasks',
  Quizes: '/quizes',
  Learning: '/learning',
} as const

export const QUIZES_PATH_SEGMENT = '/quizes/'

export const resolveBasePath = (pathname: string): string =>
  pathname.includes(QUIZES_PATH_SEGMENT) ? FlowRoutes.Quizes : FlowRoutes.Tasks

export const buildChannelContentPath = (
  basePath: string,
  workspaceId: string,
  channelId: string,
): string => `${basePath}/${workspaceId}/${channelId}/content`

export const buildChannelPendingPath = (
  basePath: string,
  workspaceId: string,
  channelId: string,
): string => `${basePath}/${workspaceId}/${channelId}/pending`
