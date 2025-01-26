import { RateLimiterMemory } from "rate-limiter-flexible"

export const saveFileRL = new RateLimiterMemory({
  points: 2,
  duration: 1,
})