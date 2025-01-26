import { RateLimiterMemory } from "rate-limiter-flexible"

export const saveFileRL = new RateLimiterMemory({
  points: 2,
  duration: 1,
})

export const createFileRL = new RateLimiterMemory({
  points: 1,
  duration: 2,
})

export const createFolderRL = new RateLimiterMemory({
  points: 1,
  duration: 2,
})

export const renameFileRL = new RateLimiterMemory({
  points: 1,
  duration: 2,
})

export const deleteFileRL = new RateLimiterMemory({
  points: 1,
  duration: 2,
})
