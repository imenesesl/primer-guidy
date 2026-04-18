import { Heading } from '@primer/react'
import { useTranslation } from 'react-i18next'

export const Quizes = () => {
  const { t: tShell } = useTranslation('shell')

  return <Heading as="h2">{tShell('rail.items.quizes')}</Heading>
}
