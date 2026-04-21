import { useMutation } from '@tanstack/react-query'
import { generateContent } from './generator.service'
import type { TaskGeneratorResponse, GenerateContentArgs } from './generator.types'

export const useGenerateContent = () =>
  useMutation<TaskGeneratorResponse, Error, GenerateContentArgs>({
    mutationFn: generateContent,
  })
