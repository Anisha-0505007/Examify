import { useCallback, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import QuestionCard from '../components/exam/QuestionCard.jsx'
import QuestionPalette from '../components/exam/QuestionPalette.jsx'
import Timer from '../components/exam/Timer.jsx'
import { useTimer } from '../hooks/useTimer.js'
import { getAttempt, updateAttempt } from '../services/attemptService.js'
import { getPaper } from '../services/paperService.js'

function ExamPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const paper = getPaper(id)
  const attemptId = searchParams.get('attempt')
  const attempt = getAttempt(attemptId)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState(() => attempt?.answers ?? {})
  const [markedForReview, setMarkedForReview] = useState(() => attempt?.markedForReview ?? [])

  const submitExam = useCallback(() => {
    if (!attempt) return
    if(!window.confirm("Are you sure you want to finalize and submit your test?")) return;
    updateAttempt(attempt.id, {
      answers,
      markedForReview,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    })
    navigate(`/results/${attempt.id}`)
  }, [answers, attempt, markedForReview, navigate])

  const { formatted } = useTimer(attempt?.durationSeconds ?? 0, submitExam)
  const question = paper?.questions?.[currentIndex]
  const answeredCount = useMemo(() => Object.values(answers).filter((answer) => String(answer).trim() !== '').length, [answers])

  if (!paper || !attempt || !question) {
    return <main className="grid min-h-screen place-items-center p-6">Exam session not found.</main>
  }

  function selectAnswer(questionId, optionIndex) {
    const nextAnswers = { ...answers, [questionId]: optionIndex }
    setAnswers(nextAnswers)
    updateAttempt(attempt.id, { answers: nextAnswers, markedForReview })
  }

  function toggleReview() {
    const questionId = question.id
    const nextMarked = markedForReview.includes(questionId)
      ? markedForReview.filter((markedId) => markedId !== questionId)
      : [...markedForReview, questionId]
    setMarkedForReview(nextMarked)
    updateAttempt(attempt.id, { answers, markedForReview: nextMarked })
  }

  return (
    <main className="app-container !p-0 flex flex-col h-screen overflow-hidden">
      {/* Simulation Header */}
      <header className="relative z-50 border-b border-white/5 bg-[#0f172a]/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <div className="hidden sm:block">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00f5ca]">{paper.examName || 'Mock Simulation'}</span>
              <h1 className="text-lg font-black tracking-tight text-white">{paper.title}</h1>
            </div>
            <div className="h-8 w-[1px] bg-white/10 hidden sm:block"></div>
            <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 border border-white/10">
              <span className="text-[10px] font-black uppercase text-white/40">Subject</span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">{question.sectionSubject || 'General'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end sm:mr-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Time Remaining</span>
              <Timer value={formatted} className="text-xl font-black text-white tabular-nums tracking-wider" />
            </div>
            <button 
              className="btn btn-primary !h-11 px-6 text-sm shadow-[0_0_20px_rgba(45,212,191,0.2)]"
              onClick={submitExam}
            >
              Finish Exam
            </button>
          </div>
        </div>
      </header>

      {/* Simulation Content area */}
      <div className="flex-1 overflow-hidden relative z-10 flex flex-col md:flex-row gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <section className="flex-1 flex flex-col gap-6 overflow-hidden">
          <div className="glass-main !p-0 overflow-hidden flex flex-col flex-1 relative">
             <div className="p-6 md:p-10 overflow-y-auto flex-1 custom-scrollbar">
                <QuestionCard question={question} index={currentIndex} selected={answers[question.id]} onSelect={selectAnswer} />
             </div>

             <div className="bg-white/5 border-t border-white/5 p-4 md:p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-white/40 tabular-nums lowercase tracking-widest">
                    <span className="text-[#00f5ca] text-lg font-black mr-1">{answeredCount}</span> / {paper.questions.length} answered
                  </span>
                </div>
                <div className="flex gap-2">
                  <button 
                    className="btn btn-secondary !bg-white/5 !border-white/10 !text-white !h-12 px-6" 
                    disabled={currentIndex === 0} 
                    onClick={() => setCurrentIndex((value) => value - 1)}
                  >
                    Previous
                  </button>
                  <button 
                    className={`btn !h-12 px-6 font-bold transition-all ${
                      markedForReview.includes(question.id) 
                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' 
                        : 'bg-white/10 text-white border border-white/20'
                    }`} 
                    onClick={toggleReview}
                  >
                    {markedForReview.includes(question.id) ? 'Review Enabled' : 'Mark for Review'}
                  </button>
                  <button 
                    className="btn btn-primary !h-12 px-8" 
                    disabled={currentIndex === paper.questions.length - 1} 
                    onClick={() => setCurrentIndex((value) => value + 1)}
                  >
                    Next
                  </button>
                </div>
             </div>
          </div>
        </section>

        <aside className="w-full md:w-80 flex flex-col h-full gap-6">
          <QuestionPalette
            answers={answers}
            currentIndex={currentIndex}
            markedForReview={markedForReview}
            questions={paper.questions}
            onJump={setCurrentIndex}
          />
        </aside>
      </div>

       {/* Floating background sphere for simulation focus */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent)] opacity-[0.03] blur-[120px] pointer-events-none rounded-full"></div>
    </main>
  )
}

export default ExamPage

