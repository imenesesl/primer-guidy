import clsx from 'clsx'
import { Button, Text } from '@primer/react'
import { useTranslation } from 'react-i18next'
import { UserAvatar } from '@primer-guidy/components-web'
import { EnrollmentStatus } from '@/services/enrollment'
import type { StudentCardProps } from './StudentCard.types'
import styles from './StudentCard.module.scss'

const AVATAR_SIZE = 64

export const StudentCard = ({
  name,
  identificationNumber,
  status,
  onToggle,
  isToggling,
}: StudentCardProps) => {
  const { t: tDirectories } = useTranslation('directories')
  const isActive = status === EnrollmentStatus.Active

  return (
    <div className={styles.root}>
      <div className={styles.avatarSection}>
        <UserAvatar name={name} size={AVATAR_SIZE} />
      </div>
      <div className={styles.info}>
        <div className={styles.nameRow}>
          <Text as="span" className={styles.name}>
            {name}
          </Text>
          <Text as="span" className={clsx(styles.statusDot, styles[status])} />
        </div>
        <Text as="span" className={styles.subtitle}>
          {identificationNumber}
        </Text>
        <Text as="span" className={clsx(styles.statusText, styles[status])}>
          {tDirectories(`students.${status}`)}
        </Text>
      </div>
      <div className={styles.actions}>
        <Button
          variant={isActive ? 'danger' : 'primary'}
          size="small"
          onClick={onToggle}
          disabled={isToggling}
        >
          {isActive ? tDirectories('students.deactivate') : tDirectories('students.activate')}
        </Button>
      </div>
    </div>
  )
}
