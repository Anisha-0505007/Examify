import { readCollection, writeCollection } from './storage.js'

const key = 'attempts'

export function listAttempts(userId) {
  return readCollection(key).filter((attempt) => attempt.userId === userId)
}

export function listAttemptsForPaper(paperId) {
  return readCollection(key).filter((attempt) => attempt.paperId === paperId)
}

export function getAttempt(id) {
  return readCollection(key).find((attempt) => attempt.id === id)
}

export function createAttempt(attempt) {
  const attempts = readCollection(key)
  const nextAttempt = {
    ...attempt,
    id: crypto.randomUUID(),
    answers: {},
    markedForReview: [],
    status: 'in-progress',
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  writeCollection(key, [nextAttempt, ...attempts])
  return nextAttempt
}

export function updateAttempt(id, updates) {
  const attempts = readCollection(key)
  const nextAttempts = attempts.map((attempt) =>
    attempt.id === id ? { ...attempt, ...updates, updatedAt: new Date().toISOString() } : attempt,
  )
  writeCollection(key, nextAttempts)
  return nextAttempts.find((attempt) => attempt.id === id)
}

export function deleteAttempt(id) {
  writeCollection(
    key,
    readCollection(key).filter((attempt) => attempt.id !== id),
  )
}
