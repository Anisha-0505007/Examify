import { readCollection, writeCollection } from './storage.js'

const key = 'papers'

export function listPapers(userId) {
  return readCollection(key).filter((paper) => paper.userId === userId)
}

export function getPaper(id) {
  return readCollection(key).find((paper) => paper.id === id)
}

export function createPaper(paper) {
  const papers = readCollection(key)
  const nextPaper = {
    ...paper,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  writeCollection(key, [nextPaper, ...papers])
  return nextPaper
}

export function updatePaper(id, updates) {
  const papers = readCollection(key)
  const nextPapers = papers.map((paper) =>
    paper.id === id ? { ...paper, ...updates, updatedAt: new Date().toISOString() } : paper,
  )
  writeCollection(key, nextPapers)
  return nextPapers.find((paper) => paper.id === id)
}

export function deletePaper(id) {
  writeCollection(
    key,
    readCollection(key).filter((paper) => paper.id !== id),
  )
}
