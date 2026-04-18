import clsx from 'clsx'
import { Button, Text } from '@primer/react'
import { PeopleIcon } from '@primer/octicons-react'
import { useTranslation } from 'react-i18next'
import type { ChannelCardProps } from './ChannelCard.types'
import styles from './ChannelCard.module.scss'

export const ChannelCard = ({
  name,
  studentCount,
  active,
  onToggle,
  onManageStudents,
  isToggling,
}: ChannelCardProps) => {
  const { t: tChannels } = useTranslation('channels')

  const statusClass = active ? 'active' : 'inactive'

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Text as="span" className={styles.name}>
          {name}
        </Text>
        <Text as="span" className={clsx(styles.statusDot, styles[statusClass])} />
      </div>
      <div className={styles.meta}>
        <PeopleIcon size={14} />
        <Text as="span" className={styles.count}>
          {tChannels('channelCard.students', { count: studentCount })}
        </Text>
      </div>
      <div className={styles.actions}>
        <Button size="small" onClick={onManageStudents}>
          {tChannels('channelCard.manage')}
        </Button>
        <Button
          variant={active ? 'danger' : 'primary'}
          size="small"
          onClick={onToggle}
          disabled={isToggling}
        >
          {active ? tChannels('channelCard.deactivate') : tChannels('channelCard.activate')}
        </Button>
      </div>
    </div>
  )
}
