import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import PaperCard from '../components/dashboard/PaperCard.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { listAttempts } from '../services/attemptService.js'
import { listPapers } from '../services/paperService.js'

function Dashboard() {
  const { user } = useAuth()
  const papers = listPapers(user.id)
  const attempts = listAttempts(user.id)
  const attemptsByPaper = useMemo(
    () => attempts.reduce((acc, attempt) => ({ ...acc, [attempt.paperId]: (acc[attempt.paperId] ?? 0) + 1 }), {}),
    [attempts],
  )

  return (
    <div className="grid gap-12">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-white/5">
        <div className="space-y-4">
          <p className="inline-block px-3 py-1 bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-[var(--accent)]/20">
            Exam Library • Ready to Practice
          </p>
          <h1 className="text-6xl font-black tracking-tight leading-[0.95] text-[var(--text)]">
            Practice papers <br/> 
            <span className="text-[var(--text)]/60">ready for simulation.</span>
          </h1>

          <p className="max-w-xl text-lg font-medium text-[var(--muted)] leading-relaxed">
            Manage your AI-extracted PDF libraries, resume saved practice sessions, and track your performance trends in one immersive workspace.
          </p>
        </div>
        <Link className="btn btn-primary h-14 px-8 text-lg shadow-[0_0_30px_rgba(45,212,191,0.2)]" to="/upload-paper">
          Upload paper
        </Link>
      </section>


      <section className="grid gap-6 sm:grid-cols-3">
        <div className="metric">
          <p className="text-xs font-black uppercase tracking-widest text-[var(--muted)]">Papers</p>
          <p className="mt-4 text-5xl font-black text-[var(--text)]">{papers.length}</p>
        </div>
        <div className="metric">
          <p className="text-xs font-black uppercase tracking-widest text-[var(--muted)]">Attempts</p>
          <p className="mt-4 text-5xl font-black text-[var(--text)]">{attempts.length}</p>
        </div>
        <div className="metric">
          <p className="text-xs font-black uppercase tracking-widest text-[var(--muted)]">With Answer Key</p>
          <p className="mt-4 text-5xl font-black text-[var(--text)]">{papers.filter((paper) => paper.answerMode === 'with-key').length}</p>
        </div>
      </section>

      {papers.length === 0 ? (
        <section className="panel flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-3xl font-black text-white">No papers in library</h2>
          <p className="mx-auto mt-4 max-w-lg text-lg font-medium text-white/40 leading-relaxed">
            Your workspace is empty. Start by uploading a practice paper PDF to begin your converted exam simulation.
          </p>
          <Link className="btn btn-primary mt-10 h-14 px-10 text-lg" to="/upload-paper">Create first paper</Link>
        </section>

      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {papers.map((paper) => (
            <PaperCard attemptsCount={attemptsByPaper[paper.id] ?? 0} key={paper.id} paper={paper} />
          ))}
        </section>
      )}
    </div>
  )
}

export default Dashboard
