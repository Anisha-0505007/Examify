function QuestionDiagram({ alt = 'Question diagram', src, isCapture = false }) {
  if (!src) return null

  return (
    <figure className="group relative overflow-hidden rounded-xl border border-[var(--border)] bg-white transition hover:shadow-lg">
      <img className="max-h-[32rem] w-full object-contain p-2" src={src} alt={alt} />
      {isCapture && (
        <span className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-0.5 text-[0.65rem] font-bold text-white backdrop-blur-md">
          PDF Capture
        </span>
      )}
    </figure>
  )
}

export default QuestionDiagram
