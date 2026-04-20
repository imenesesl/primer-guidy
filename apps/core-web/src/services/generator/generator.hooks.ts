import { useMutation } from '@tanstack/react-query'
import { generateContent } from './generator.service'
import type { TaskGeneratorRequest, TaskGeneratorResponse } from './generator.types'

export const useGenerateContent = () =>
  useMutation<TaskGeneratorResponse, Error, TaskGeneratorRequest>({
    mutationFn: generateContent,
  })
