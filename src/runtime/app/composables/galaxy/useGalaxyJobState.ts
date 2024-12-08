import { JobTerminalStates } from '@rplanel/galaxy-js'
import type { JobTerminalState, JobState } from '@rplanel/galaxy-js'
import type { MaybeRef } from 'vue'
import { toValue } from 'vue'

export const useGalaxyJobState = () => {
  const isTerminalState = (state: MaybeRef<JobState | null> = null) => {
    const stateVal = toValue(state)
    if (stateVal) {
      return JobTerminalStates.includes(toValue(state) as JobTerminalState)
    }
    else { return false }
  }

  return { isTerminalState }
}
