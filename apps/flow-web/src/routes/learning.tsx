import { createFileRoute } from '@tanstack/react-router'
import { Learning } from '@/modules/Learning'

const MOCK_STUDENT_NAME = ''

function LearningRoute() {
  return <Learning studentName={MOCK_STUDENT_NAME} />
}

export const Route = createFileRoute('/learning')({
  component: LearningRoute,
})
