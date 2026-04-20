import { Link, useParams } from 'react-router-dom'
import ResultSummary from '../components/results/ResultSummary.jsx'
import { getAttempt } from '../services/attemptService.js'
import { getPaper } from '../services/paperService.js'
import { scoreAttempt } from '../utils/scoring.js'
import QuestionDiagram from '../components/common/QuestionDiagram.jsx'
import MathText from '../components/common/MathText.jsx'

function ResultsPage() {
  const { attemptId } = useParams()
  const attempt = getAttempt(attemptId)
  const paper = attempt ? getPaper(attempt.paperId) : null

  if (!attempt || !paper) {
    return <section className="panel p-6">Result not found.</section>
  }

  const stats = scoreAttempt(paper, attempt)

  return (
    <div className="grid gap-8">
      <section className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
        <div>
          <p className="font-black uppercase text-[var(--accent-strong)]">Results</p>
          <h1 className="mt-2 text-4xl font-black">{paper.title}</h1>
          <p className="mt-3 text-[var(--muted)]">Submitted {new Date(attempt.submittedAt || attempt.updatedAt).toLocaleString()}</p>
        </div>
        <Link className="btn btn-secondary" to={`/papers/${paper.id}`}>Back to paper</Link>
      </section>

      <ResultSummary stats={stats} />

      {stats.hasKey && (
        <section className="panel overflow-hidden">
          <div className="border-b border-[var(--border)] p-5">
            <h2 className="text-2xl font-black">Question-wise analysis</h2>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {paper.questions.map((question, index) => {
              const selected = attempt.answers?.[question.id]
              const correct = question.correctOption
              const selectedLabel = question.type === 'numerical' ? selected : question.options?.[selected]
              const correctLabel = question.type === 'numerical' ? question.correctAnswer : question.options?.[correct]
              return (
                <article className="p-5" key={question.id}>
                  <div className="flex gap-2 font-black">
                    <span>Q{index + 1}.</span>
                    <MathText text={question.text} />
                  </div>
                  <div className="mt-4">
                    <QuestionDiagram alt={`Diagram for question ${index + 1}`} src={question.diagramUrl} />
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Selected: {selected === undefined || selected === '' ? 'Not attempted' : selectedLabel}
                    {stats.hasKey && ` - Correct: ${correctLabel}`}
                  </p>
                </article>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

export default ResultsPage
