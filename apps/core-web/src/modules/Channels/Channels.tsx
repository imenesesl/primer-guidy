import { useState } from 'react'
import { Button, IconButton, Text, TextInput } from '@primer/react'
import { SearchIcon, PlusIcon, SyncIcon } from '@primer/octicons-react'
import { useTranslation } from 'react-i18next'
import { useCurrentUser } from '@/context/user.context'
import { useChannels, useToggleChannelActive } from '@/services/channel'
import { useEnrolledStudents } from '@/services/enrollment'
import { CreateChannelDialog } from './CreateChannelDialog'
import { ChannelStudentsDialog } from './ChannelStudentsDialog'
import { ChannelCard } from './ChannelCard'
import { useFilteredChannels } from './useFilteredChannels'
import styles from './Channels.module.scss'

export const Channels = () => {
  const { t: tChannels } = useTranslation('channels')
  const { uid } = useCurrentUser()
  const [search, setSearch] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null)

  const { data: channels, isLoading, refetch, isFetching } = useChannels(uid)
  const { data: students } = useEnrolledStudents(uid)
  const {
    mutate: toggleActive,
    isPending: isToggling,
    variables: toggleVars,
  } = useToggleChannelActive()

  const filteredChannels = useFilteredChannels(channels, search)
  const selectedChannel = channels?.find((ch) => ch.id === selectedChannelId) ?? null

  const handleToggle = (channelId: string, currentActive: boolean) => {
    toggleActive({ teacherUid: uid, channelId, active: !currentActive })
  }

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <TextInput
          leadingVisual={SearchIcon}
          placeholder={tChannels('toolbar.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <div className={styles.actions}>
          <IconButton
            icon={SyncIcon}
            aria-label={tChannels('toolbar.reload')}
            onClick={() => refetch()}
            disabled={isFetching}
          />
          <Button
            variant="primary"
            leadingVisual={PlusIcon}
            className={styles.createButton}
            onClick={() => setIsCreateOpen(true)}
          >
            {tChannels('toolbar.create')}
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className={styles.grid}>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className={styles.cardSkeleton}>
              <div className={styles.skeletonHeader}>
                <div className={styles.skeletonName} />
                <div className={styles.skeletonDot} />
              </div>
              <div className={styles.skeletonMeta}>
                <div className={styles.skeletonIcon} />
                <div className={styles.skeletonCount} />
              </div>
              <div className={styles.skeletonActions}>
                <div className={styles.skeletonButton} />
                <div className={styles.skeletonButton} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && filteredChannels.length === 0 && (
        <div className={styles.emptyState}>
          <Text as="p" className={styles.emptyText}>
            {tChannels('empty')}
          </Text>
        </div>
      )}

      {filteredChannels.length > 0 && (
        <div className={styles.grid}>
          {filteredChannels.map((channel) => (
            <ChannelCard
              key={channel.id}
              name={channel.name}
              studentCount={channel.students.length}
              active={channel.active}
              onToggle={() => handleToggle(channel.id, channel.active)}
              onManageStudents={() => setSelectedChannelId(channel.id)}
              isToggling={isToggling && toggleVars?.channelId === channel.id}
            />
          ))}
        </div>
      )}

      <CreateChannelDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <ChannelStudentsDialog
        channel={selectedChannel}
        students={students ?? []}
        onClose={() => setSelectedChannelId(null)}
      />
    </div>
  )
}
