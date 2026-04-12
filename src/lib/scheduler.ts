/**
 * SM-2 Spaced Repetition Algorithm for web.
 */

export type QualityScore = 0 | 1 | 2 | 3 | 4 | 5

export interface SM2State {
  interval: number
  easeFactor: number
  repetitions: number
}

export const INITIAL_SM2_STATE: SM2State = {
  interval: 1,
  easeFactor: 2.5,
  repetitions: 0,
}

export function computeNextState(current: SM2State, quality: QualityScore): SM2State {
  let { interval, easeFactor, repetitions } = current

  if (quality >= 3) {
    if (repetitions === 0) interval = 1
    else if (repetitions === 1) interval = 6
    else interval = Math.round(interval * easeFactor)
    repetitions += 1
  } else {
    repetitions = 0
    interval = 1
  }

  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  easeFactor = Math.max(1.3, easeFactor)

  return { interval, easeFactor, repetitions }
}

export type ReviewAction = 'got_it' | 'got_it_with_hint' | 'still_confused'

export function actionToQuality(action: ReviewAction): QualityScore {
  switch (action) {
    case 'got_it': return 5
    case 'got_it_with_hint': return 3
    case 'still_confused': return 1
  }
}
