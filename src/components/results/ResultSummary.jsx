function ResultSummary({ stats }) {
  if (!stats.hasKey) {
    return (
      <section className="panel p-6">
        <h2 className="text-2xl font-black">Response saved</h2>
        <p className="mt-2 text-[var(--muted)]">
          This paper does not have an answer key yet. Add the key later to evaluate saved attempts.
        </p>
      </section>
    )
  }

  return (
    <>
      {stats.totalKeyed < stats.totalQuestions && (
        <div className="rounded-lg bg-orange-50 text-orange-900 border border-orange-200 p-4 font-medium text-sm">
          <strong>Partial Answer Key:</strong> Only {stats.totalKeyed} out of {stats.totalQuestions} questions have an answer key set. The remaining {stats.totalQuestions - stats.totalKeyed} questions are not included in the correct/incorrect totals.
        </div>
      )}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="metric">
          <p className="text-sm font-bold text-[var(--muted)]">Correct</p>
          <p className="mt-2 text-3xl font-black text-[var(--success)]">{stats.correct}</p>
        </div>
        <div className="metric">
          <p className="text-sm font-bold text-[var(--muted)]">Incorrect</p>
          <p className="mt-2 text-3xl font-black text-[var(--danger)]">{stats.incorrect}</p>
        </div>
        <div className="metric">
          <p className="text-sm font-bold text-[var(--muted)]">Attempted</p>
          <p className="mt-2 text-3xl font-black">{stats.attempted}</p>
        </div>
        <div className="metric">
          <p className="text-sm font-bold text-[var(--muted)]">Unattempted</p>
          <p className="mt-2 text-3xl font-black">{stats.unattempted}</p>
        </div>
      </section>
    </>
  )
}

export default ResultSummary
