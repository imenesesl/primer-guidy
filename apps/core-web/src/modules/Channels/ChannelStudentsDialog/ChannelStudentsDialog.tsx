import { useState, useEffect, useMemo } from 'react'
import { Dialog, FormControl, Checkbox, Text } from '@primer/react'
import { useTranslation } from 'react-i18next'
import { useCurrentUser } from '@/context/user.context'
import { useUpdateChannelStudents } from '@/services/channel'
import { EnrollmentStatus } from '@/services/enrollment'
import type { ChannelStudentsDialogProps } from './ChannelStudentsDialog.types'
import styles from './ChannelStudentsDialog.module.scss'

export const ChannelStudentsDialog = ({
  channel,
  students,
  onClose,
}: ChannelStudentsDialogProps) => {
  const { t: tChannels } = useTranslation('channels')
  const { uid } = useCurrentUser()
  const { mutate: updateStudents, isPending } = useUpdateChannelStudents()
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const activeStudents = useMemo(
    () => students.filter((s) => s.status === EnrollmentStatus.Active),
    [students],
  )

  useEffect(() => {
    if (channel) {
      setSelected(new Set(channel.students))
    }
  }, [channel])

  const handleToggle = (identificationNumber: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(identificationNumber)) {
        next.delete(identificationNumber)
      } else {
        next.add(identificationNumber)
      }
      return next
    })
  }

  const handleSave = () => {
    if (!channel) return
    updateStudents(
      { teacherUid: uid, channelId: channel.id, students: [...selected] },
      { onSuccess: onClose },
    )
  }

  if (!channel) return null

  return (
    <Dialog
      title={tChannels('manageStudents.title')}
      width="medium"
      onClose={onClose}
      footerButtons={[
        {
          buttonType: 'default',
          content: tChannels('manageStudents.cancel'),
          onClick: onClose,
        },
        {
          buttonType: 'primary',
          content: tChannels('manageStudents.save'),
          onClick: handleSave,
          disabled: isPending,
        },
      ]}
    >
      <div className={styles.body}>
        {activeStudents.length === 0 ? (
          <Text as="p" className={styles.empty}>
            {tChannels('manageStudents.noActiveStudents')}
          </Text>
        ) : (
          <div className={styles.list}>
            {activeStudents.map((student) => (
              <FormControl key={student.identificationNumber}>
                <Checkbox
                  checked={selected.has(student.identificationNumber)}
                  onChange={() => handleToggle(student.identificationNumber)}
                />
                <FormControl.Label>
                  {student.name} ({student.identificationNumber})
                </FormControl.Label>
              </FormControl>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  )
}
