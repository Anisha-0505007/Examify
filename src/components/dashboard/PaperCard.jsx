import { Link } from 'react-router-dom'

function PaperCard({ paper, attemptsCount }) {
  return (
    <article className="metric grid gap-5 p-6">
      <div>
        <div className="flex items-start justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">{paper.examName || 'Practice exam'}</p>
          <div className="h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]"></div>
        </div>
        <h3 className="mt-2 text-xl font-black text-[var(--text)]">{paper.title}</h3>
        <p className="mt-2 text-sm text-[var(--muted)] line-clamp-2">
          {paper.subject || 'General'} • {paper.duration} min • {paper.questions?.length ?? 0} questions
        </p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-bold text-[var(--text)]">
          {paper.answerMode === 'with-key' ? '✓ Answer Key' : 'No Key'}
        </span>
        <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-bold text-[var(--muted)]">
          {attemptsCount} attempts
        </span>
      </div>

      <Link className="btn btn-primary mt-2 group" to={`/papers/${paper.id}`}>
        <span>Open paper</span>
        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </Link>
    </article>

  )
}

export default PaperCard
