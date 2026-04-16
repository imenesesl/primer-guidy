import { createContext } from 'react'
import type { CloudServices } from '../factory.types'

export const CloudServicesContext = createContext<CloudServices | null>(null)

export const CloudServicesProvider = CloudServicesContext.Provider
