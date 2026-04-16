import { NOON_HOUR, EVENING_HOUR } from './date.constants'

export const getGreetingKey = (): string => {
  const hour = new Date().getHours()
  if (hour < NOON_HOUR) return 'greetings.morning'
  if (hour < EVENING_HOUR) return 'greetings.afternoon'
  return 'greetings.evening'
}
