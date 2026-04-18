import { useState } from 'react'
import { Button, TextInput } from '@primer/react'
import { SearchIcon, PlusIcon } from '@primer/octicons-react'
import { useTranslation } from 'react-i18next'
import { InviteStudentsDialog } from './InviteStudentsDialog'
import styles from './UsersTab.module.scss'

export const UsersTab = () => {
  const { t: tDirectories } = useTranslation('directories')
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <TextInput
          leadingVisual={SearchIcon}
          placeholder={tDirectories('users.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <Button
          variant="primary"
          leadingVisual={PlusIcon}
          className={styles.inviteButton}
          onClick={() => setIsDialogOpen(true)}
        >
          {tDirectories('users.inviteStudents')}
        </Button>
      </div>
      <InviteStudentsDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </div>
  )
}
