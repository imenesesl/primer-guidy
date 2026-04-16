import { Heading, Text } from '@primer/react'
import { useTranslation } from 'react-i18next'
import { UserAvatar } from '@primer-guidy/components-web'
import { getGreetingKey } from '@/utils/date.utils'
import { useCurrentUser } from '@/context/user.context'
import styles from './Home.module.scss'

const HOME_AVATAR_SIZE = 64

export const Home = () => {
  const { t: tHome } = useTranslation('home')
  const { t: tCommon } = useTranslation('common')
  const user = useCurrentUser()
  const greeting = tCommon(getGreetingKey())

  return (
    <div className={styles.root}>
      <UserAvatar name={user.name} src={user.avatarUrl ?? undefined} size={HOME_AVATAR_SIZE} />
      <Heading as="h1">{tHome('welcome', { greeting, name: user.name })}</Heading>
      <Text as="p" className={styles.subtitle}>
        {tHome('subtitle')}
      </Text>
    </div>
  )
}
