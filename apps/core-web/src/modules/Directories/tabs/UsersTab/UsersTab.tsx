import { useState } from 'react'
import { Button, IconButton, Text, TextInput } from '@primer/react'
import { SearchIcon, PlusIcon, SyncIcon } from '@primer/octicons-react'
import { useTranslation } from 'react-i18next'
import { useCurrentUser } from '@/context/user.context'
import {
  useEnrolledStudents,
  useToggleEnrollmentStatus,
  EnrollmentStatus,
} from '@/services/enrollment'
import { InviteStudentsDialog } from './InviteStudentsDialog'
import { StudentCard } from './StudentCard'
import { useFilteredStudents } from './useFilteredStudents'
import styles from './UsersTab.module.scss'

export const UsersTab = () => {
  const { t: tDirectories } = useTranslation('directories')
  const { uid, name: teacherName } = useCurrentUser()
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { data: students, isLoading, refetch, isFetching } = useEnrolledStudents(uid)
  const { mutate: toggleStatus, isPending, variables } = useToggleEnrollmentStatus()

  const filteredStudents = useFilteredStudents(students, search)

  const handleToggle = (identificationNumber: string, currentStatus: EnrollmentStatus) => {
    const newStatus =
      currentStatus === EnrollmentStatus.Active
        ? EnrollmentStatus.Inactive
        : EnrollmentStatus.Active
    toggleStatus({ teacherUid: uid, teacherName, identificationNumber, status: newStatus })
  }

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
        <div className={styles.actions}>
          <IconButton
            icon={SyncIcon}
            aria-label={tDirectories('users.reload')}
            onClick={() => refetch()}
            disabled={isFetching}
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
      </div>

      {isLoading && (
        <div className={styles.grid}>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className={styles.cardSkeleton}>
              <div className={styles.skeletonAvatar} />
              <div className={styles.skeletonInfo}>
                <div className={styles.skeletonNameRow}>
                  <div className={styles.skeletonName} />
                  <div className={styles.skeletonDot} />
                </div>
                <div className={styles.skeletonSubtitle} />
                <div className={styles.skeletonStatus} />
              </div>
              <div className={styles.skeletonActions}>
                <div className={styles.skeletonButton} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && filteredStudents.length === 0 && (
        <div className={styles.emptyState}>
          <Text as="p" className={styles.emptyText}>
            {tDirectories('students.empty')}
          </Text>
        </div>
      )}

      {filteredStudents.length > 0 && (
        <div className={styles.grid}>
          {filteredStudents.map((student) => (
            <StudentCard
              key={student.identificationNumber}
              name={student.name}
              identificationNumber={student.identificationNumber}
              status={student.status}
              onToggle={() => handleToggle(student.identificationNumber, student.status)}
              isToggling={
                isPending && variables?.identificationNumber === student.identificationNumber
              }
            />
          ))}
        </div>
      )}

      <InviteStudentsDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </div>
  )
}
