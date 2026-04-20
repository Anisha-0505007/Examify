import { useMemo } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import { listAttempts } from '../services/attemptService.js'
import { getPaper, listPapers } from '../services/paperService.js'
import { scoreAttempt } from '../utils/scoring.js'

function AnalyticsPage() {
  const { user } = useAuth()
  const papers = listPapers(user.id)
  const attempts = listAttempts(user.id).filter((attempt) => attempt.status === 'submitted')
  const scoredAttempts = useMemo(
    () =>
      attempts
        .map((attempt) => {
          const paper = getPaper(attempt.paperId)
          return paper ? { attempt, paper, stats: scoreAttempt(paper, attempt) } : null
        })
        .filter(Boolean),
    [attempts],
  )
  const evaluated = scoredAttempts.filter((item) => item.stats.hasKey)
  const averageScore = evaluated.length
    ? Math.round(evaluated.reduce((sum, item) => sum + (item.stats.totalScore / item.stats.maxScore) * 100, 0) / evaluated.length)
    : 0

  return (
    <div className="grid gap-8">
      <section>
        <p className="font-black uppercase text-[var(--accent-strong)]">Analytics</p>
        <h1 className="mt-2 text-4xl font-black text-[var(--text)]">Performance across attempts</h1>
        <p className="mt-3 max-w-2xl text-[var(--muted)]">
          Track saved sessions, evaluated scores, and papers waiting for answer keys.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="metric">
          <p className="text-sm font-bold text-[var(--muted)]">Submitted attempts</p>
          <p className="mt-2 text-3xl font-black text-[var(--text)]">{attempts.length}</p>
        </div>
        <div className="metric">
          <p className="text-sm font-bold text-[var(--muted)]">Average score</p>
          <p className="mt-2 text-3xl font-black text-[var(--text)]">{averageScore}%</p>
        </div>
        <div className="metric">
          <p className="text-sm font-bold text-[var(--muted)]">Papers without key</p>
          <p className="mt-2 text-3xl font-black text-[var(--text)]">{papers.filter((paper) => paper.answerMode !== 'with-key').length}</p>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b border-[var(--border)] p-5">
          <h2 className="text-2xl font-black text-[var(--text)]">Recent attempts</h2>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {scoredAttempts.length === 0 ? (
            <p className="p-5 text-[var(--muted)]">No submitted attempts yet.</p>
          ) : (
            scoredAttempts.map(({ attempt, paper, stats }) => (
              <article className="grid gap-2 p-5 md:grid-cols-[1fr_auto] md:items-center" key={attempt.id}>
                <div>
                  <p className="font-black text-[var(--text)]">{paper.title}</p>
                  <p className="text-sm text-[var(--muted)]">{new Date(attempt.submittedAt || attempt.updatedAt).toLocaleString()}</p>
                </div>
                <p className="font-black text-[var(--text)]">{stats.hasKey ? `${stats.totalScore}/${stats.maxScore}` : 'Key pending'}</p>
              </article>
            ))
          )}
        </div>
      </section>

    </div>
  )
}

export default AnalyticsPage
