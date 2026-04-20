import { useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { Dialog } from '@primer/react'
import { NoteIcon, BookIcon } from '@primer/octicons-react'
import { useTranslation } from 'react-i18next'
import {
  GeneratorSchema,
  TaskKind,
  MAX_PROMPT_LENGTH,
  MAX_CONTEXT_LENGTH,
} from '@/services/generator'
import type { GeneratorFormData } from '@/services/generator'
import { TaskTypeCard } from './TaskTypeCard'
import { StudentBanner } from './StudentBanner'
import { TextareaCard } from './TextareaCard'
import { HomeworkOptionsCard } from './HomeworkOptionsCard'
import type { GeneratorFormProps } from './GeneratorForm.types'
import styles from './GeneratorForm.module.scss'

export const GeneratorForm = ({
  isOpen,
  onClose,
  students,
  onSubmit,
  isPending,
}: GeneratorFormProps) => {
  const { t: tChannels } = useTranslation('channels')

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<GeneratorFormData>({
    resolver: valibotResolver(GeneratorSchema),
    defaultValues: {
      task: TaskKind.Quiz,
      prompt: '',
      context: '',
      questionCount: 4,
      openQuestion: false,
    },
    mode: 'onChange',
  })

  const task = watch('task')
  const promptLength = watch('prompt').length
  const contextLength = watch('context').length

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!isOpen) return null

  return (
    <Dialog
      title={tChannels('generator.title')}
      width="large"
      onClose={handleClose}
      footerButtons={[
        {
          buttonType: 'default',
          content: tChannels('generator.cancel'),
          onClick: handleClose,
        },
        {
          buttonType: 'primary',
          content: isPending ? tChannels('generator.generating') : tChannels('generator.generate'),
          onClick: handleSubmit(onSubmit),
          disabled: !isValid || isPending,
        },
      ]}
    >
      <div className={styles.body}>
        <TaskTypeCard control={control} />
        <StudentBanner studentCount={students.length} />
        <TextareaCard
          icon={<NoteIcon size={16} />}
          title={tChannels('generator.prompt')}
          hint={tChannels('generator.promptHint')}
          registration={register('prompt')}
          maxLength={MAX_PROMPT_LENGTH}
          currentLength={promptLength}
          rows={3}
          error={errors.prompt}
          errorLabel={errors.prompt ? tChannels(`validation.${errors.prompt.message}`) : undefined}
        />
        <TextareaCard
          icon={<BookIcon size={16} />}
          title={tChannels('generator.context')}
          hint={tChannels('generator.contextHint')}
          registration={register('context')}
          maxLength={MAX_CONTEXT_LENGTH}
          currentLength={contextLength}
          rows={4}
          error={errors.context}
          errorLabel={
            errors.context ? tChannels(`validation.${errors.context.message}`) : undefined
          }
        />
        {task === TaskKind.Homework && (
          <HomeworkOptionsCard
            questionCountRegistration={register('questionCount', { valueAsNumber: true })}
            openQuestionRegistration={register('openQuestion')}
            questionCountError={errors.questionCount}
            questionCountErrorLabel={
              errors.questionCount
                ? tChannels(`validation.${errors.questionCount.message}`)
                : undefined
            }
          />
        )}
      </div>
    </Dialog>
  )
}
