import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useFirestore } from '@primer-guidy/cloud-services'
import {
  getChannels,
  createChannel,
  updateChannelStudents,
  toggleChannelActive,
} from './channel.service'
import type { ChannelDocument } from './channel.types'

const CHANNELS_KEY = 'channels' as const

export const useChannels = (teacherUid: string) => {
  const firestore = useFirestore()
  return useQuery<ChannelDocument[]>({
    queryKey: [CHANNELS_KEY, teacherUid],
    queryFn: () => getChannels(firestore, teacherUid),
    enabled: teacherUid.length > 0,
  })
}

interface CreateChannelArgs {
  readonly teacherUid: string
  readonly name: string
}

export const useCreateChannel = () => {
  const firestore = useFirestore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ teacherUid, name }: CreateChannelArgs) =>
      createChannel(firestore, teacherUid, name),
    onSuccess: (_, { teacherUid }) => {
      queryClient.invalidateQueries({ queryKey: [CHANNELS_KEY, teacherUid] })
    },
  })
}

interface UpdateStudentsArgs {
  readonly teacherUid: string
  readonly channelId: string
  readonly students: readonly string[]
}

export const useUpdateChannelStudents = () => {
  const firestore = useFirestore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ teacherUid, channelId, students }: UpdateStudentsArgs) =>
      updateChannelStudents(firestore, teacherUid, channelId, students),
    onSuccess: (_, { teacherUid }) => {
      queryClient.invalidateQueries({ queryKey: [CHANNELS_KEY, teacherUid] })
    },
  })
}

interface ToggleActiveArgs {
  readonly teacherUid: string
  readonly channelId: string
  readonly active: boolean
}

export const useToggleChannelActive = () => {
  const firestore = useFirestore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ teacherUid, channelId, active }: ToggleActiveArgs) =>
      toggleChannelActive(firestore, teacherUid, channelId, active),
    onSuccess: (_, { teacherUid }) => {
      queryClient.invalidateQueries({ queryKey: [CHANNELS_KEY, teacherUid] })
    },
  })
}
