import { useCallback, useMemo, useState } from 'react'
import { Button, Flash } from '@primer/react'
import { PlusIcon } from '@primer/octicons-react'
import { useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useCurrentUser } from '@/context/user.context'
import { useChannels } from '@/services/channel'
import { useGenerateContent, ProcessType, TaskKind } from '@/services/generator'
import type { GeneratorFormData, TaskGeneratorResponse } from '@/services/generator'
import { GeneratorForm } from '@/modules/GeneratorForm'
import styles from './ContentTab.module.scss'

const JSON_INDENT = 2

export const ContentTab = () => {
  const { t: tChannels } = useTranslation('channels')
  const { channelId } = useParams({ strict: false }) as { channelId: string }
  const { uid } = useCurrentUser()
  const { data: channels } = useChannels(uid)
  const [isOpen, setIsOpen] = useState(false)
  const [result, setResult] = useState<TaskGeneratorResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { mutate, isPending } = useGenerateContent()

  const students = useMemo(() => {
    const channel = channels?.find((ch) => ch.id === channelId)
    return channel?.students ?? []
  }, [channels, channelId])

  const handleSubmit = useCallback(
    (data: GeneratorFormData) => {
      setError(null)
      mutate(
        {
          type: ProcessType.TaskGenerator,
          task: data.task,
          prompt: data.prompt,
          context: data.context,
          students,
          ...(data.task === TaskKind.Homework && {
            questionCount: data.questionCount,
            openQuestion: data.openQuestion,
          }),
        },
        {
          onSuccess: (response) => {
            setResult(response)
            setIsOpen(false)
          },
          onError: (err) => {
            setError(err.message)
          },
        },
      )
    },
    [mutate, students],
  )

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <Button variant="primary" leadingVisual={PlusIcon} onClick={() => setIsOpen(true)}>
          {tChannels('generator.createContent')}
        </Button>
      </div>

      {error && (
        <Flash variant="danger" className={styles.flash}>
          {error}
        </Flash>
      )}

      {result && (
        <pre className={styles.jsonOutput}>{JSON.stringify(result, null, JSON_INDENT)}</pre>
      )}

      <GeneratorForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        students={students}
        onSubmit={handleSubmit}
        isPending={isPending}
      />
    </div>
  )
}
