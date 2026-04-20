import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { createAttempt, listAttemptsForPaper } from '../services/attemptService.js'
import { deletePaper, getPaper, updatePaper } from '../services/paperService.js'
import { uploadAnswerKey } from '../services/aiService.js'

import QuestionDiagram from '../components/common/QuestionDiagram.jsx'
import MathText from '../components/common/MathText.jsx'

function PaperDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const paper = getPaper(id)
  const attempts = listAttemptsForPaper(id)
  const hasKey = useMemo(() => paper?.questions?.some((question) => Number.isInteger(question.correctOption) || (question.type === 'numerical' && question.correctAnswer)), [paper])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)
  if (!paper) {
    return <section className="panel p-6">Paper not found.</section>
  }

  function startAttempt() {
    const attempt = createAttempt({
      paperId: paper.id,
      userId: user.id,
      durationSeconds: paper.duration * 60,
    })
    navigate(`/exam/${paper.id}?attempt=${attempt.id}`)
  }

  async function handleUploadKey(e) {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)
    try {
      const answers = await uploadAnswerKey(file)
      
      const newQuestions = paper.questions.map((q, idx) => {
        const match = answers.find(a => parseInt(a.q, 10) === q.number || parseInt(a.q, 10) === idx + 1)
        if (!match) return q
        
        const ans = match.a
        let updatedQ = { ...q }
        
        if (q.type === 'numerical') {
          updatedQ.correctAnswer = ans.toString()
        } else {
          const ansStr = String(ans).trim().toUpperCase()
          const letterMatch = ansStr.match(/[A-D]/)
          if (letterMatch) {
            updatedQ.correctOption = letterMatch[0].charCodeAt(0) - 65
          } else {
            const numMatch = ansStr.match(/[1-4]/)
            if (numMatch) {
              updatedQ.correctOption = parseInt(numMatch[0], 10) - 1
            }
          }
        }
        return updatedQ
      })

      updatePaper(paper.id, {
        answerMode: 'with-key',
        questions: newQuestions
      })
      navigate(0)
    } catch (err) {
      console.error(err)
      alert("Failed to parse answer key: " + err.message)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }


  function removePaper() {
    deletePaper(paper.id)
    navigate('/dashboard')
  }

  function removeQuestion(questionId) {
    if (!window.confirm("Are you sure you want to permanently remove this question from the paper?")) return;
    
    const newQuestions = paper.questions
      .filter((q) => q.id !== questionId)
      .map((q, idx) => ({ ...q, number: idx + 1 }));

    updatePaper(paper.id, { questions: newQuestions });
    navigate(0);
  }

  return (
    <div className="grid gap-8">
      <section className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
        <div>
          <p className="font-black uppercase text-[var(--accent-strong)]">{paper.examName || 'Practice exam'}</p>
          <h1 className="mt-2 text-4xl font-black">{paper.title}</h1>
          <p className="mt-3 text-[var(--muted)]">
            {paper.subject || 'General'} - {paper.duration} minutes - {paper.questions.length} questions - {hasKey ? 'answer key available' : 'answer key pending'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="btn btn-primary" onClick={startAttempt}>Start exam</button>
          <input 
            type="file" 
            accept=".pdf, .docx, .txt, image/png, image/jpeg" 
            style={{display: 'none'}} 
            ref={fileInputRef} 
            onChange={handleUploadKey} 
          />
          <button 
            className="btn btn-secondary bg-zinc-200 text-zinc-900 border border-zinc-300 font-bold" 
            disabled={isUploading}
            onClick={() => fileInputRef.current.click()}
          >
            {isUploading ? 'Extracting Key...' : 'Upload Answer Key'}
          </button>
          <button className="btn btn-danger" onClick={removePaper}>Delete</button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="metric">
          <p className="text-sm font-bold text-[var(--muted)]">Attempts</p>
          <p className="mt-2 text-3xl font-black">{attempts.length}</p>
        </div>
        <div className="metric">
          <p className="text-sm font-bold text-[var(--muted)]">Total Marks</p>
          <p className="mt-2 text-3xl font-black">{paper.totalMarks}</p>
        </div>
        <div className="metric">
          <p className="text-sm font-bold text-[var(--muted)]">Total Subjects</p>
          <p className="mt-2 text-3xl font-black">{new Set(paper.sections?.map(s => s.subject) || [paper.subject]).size}</p>
        </div>
      </section>

      {paper.sections?.length > 0 && (
        <section className="grid gap-4">
          <h2 className="text-2xl font-black">Paper Sections</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paper.sections.map((section) => (
              <div key={section.id} className="panel p-5 border-l-4 border-l-[var(--accent)]">
                <p className="font-black uppercase text-[var(--accent-strong)] text-xs">{section.subject}</p>
                <h3 className="text-xl font-bold mt-1">{section.name}</h3>
                <div className="flex gap-4 mt-3 text-sm font-bold">
                  <span className="text-[var(--success)]">+{section.positiveMarks} for correct</span>
                  <span className="text-[var(--danger)]">-{section.negativeMarks} for wrong</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {attempts.length > 0 && (
        <section className="panel overflow-hidden">
          <div className="border-b border-[var(--border)] p-5">
            <h2 className="text-2xl font-black">Past attempts</h2>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {attempts.map((attempt) => (
              <Link className="flex flex-wrap items-center justify-between gap-3 p-5 hover:bg-[var(--surface-muted)]" key={attempt.id} to={`/results/${attempt.id}`}>
                <span className="font-bold">{new Date(attempt.startedAt).toLocaleString()}</span>
                <span className="text-sm font-bold text-[var(--muted)]">{attempt.status}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-4">
        <h2 className="text-2xl font-black">Questions</h2>
        {paper.questions.map((question, index) => (
          <article className="panel p-5 relative" key={question.id}>
            <div className="flex justify-between items-start">
              <p className="text-sm font-black text-[var(--accent-strong)]">
                Question {index + 1} {question.sectionName ? `(${question.sectionName})` : ''}
              </p>
              <button 
                className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md text-xs font-bold transition-colors"
                onClick={() => removeQuestion(question.id)}
              >
                Delete
              </button>
            </div>
            <MathText isHeader={false} className="mt-2 block font-bold" text={question.text} />
            <div className="mt-4">
              <QuestionDiagram alt={`Diagram for question ${index + 1}`} src={question.diagramUrl} />
            </div>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {question.topic || 'General'} • {question.marks} Marks
            </p>
          </article>
        ))}
      </section>
    </div>
  )
}

export default PaperDetails
