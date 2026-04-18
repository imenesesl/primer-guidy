import {
  ChecklistIcon,
  NoteIcon,
  TasklistIcon,
  StarIcon,
  BookIcon,
  BeakerIcon,
} from '@primer/octicons-react'
import type { RailItemConfig, SidebarItemConfig } from '@primer-guidy/components-web'
import { FlowRoutes } from '@/routes/routes'

export const RAIL_ITEMS: readonly RailItemConfig[] = [
  {
    icon: ChecklistIcon,
    labelKey: 'rail.items.tasks',
    path: FlowRoutes.Tasks,
    fallbackActive: true,
  },
  {
    icon: NoteIcon,
    labelKey: 'rail.items.quizes',
    path: FlowRoutes.Quizes,
  },
]

export const SIDEBAR_ITEMS_MAP: Record<string, readonly SidebarItemConfig[]> = {
  [FlowRoutes.Tasks]: [
    { icon: TasklistIcon, labelKey: 'sidebar.items.myTasks', path: FlowRoutes.Tasks },
    { icon: StarIcon, labelKey: 'sidebar.items.favorites', path: FlowRoutes.Tasks },
  ],
  [FlowRoutes.Quizes]: [
    { icon: BookIcon, labelKey: 'sidebar.items.myQuizes', path: FlowRoutes.Quizes },
    { icon: BeakerIcon, labelKey: 'sidebar.items.practice', path: FlowRoutes.Quizes },
  ],
}
