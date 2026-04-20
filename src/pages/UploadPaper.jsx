import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { createPaper } from '../services/paperService.js'
import { parsePaperFile } from '../services/parserService.js'
import { answerModes, emptyPaperForm } from '../utils/constants.js'
import QuestionDiagram from '../components/common/QuestionDiagram.jsx'
import PdfSnipper from '../components/common/PdfSnipper.jsx'
import { hasSymbolArtifacts, insertAtCursor, mathSymbols } from '../utils/symbols.js'
import { getApiKey, setApiKey } from '../services/aiService.js'

function UploadPaper() {
  const [form, setForm] = useState(emptyPaperForm)
  const [file, setFile] = useState(null)
  const [questions, setQuestions] = useState([])
  const [pageImages, setPageImages] = useState([])
  const [snippingIndex, setSnippingIndex] = useState(null)
  const [parserNote, setParserNote] = useState('')
  const [isParsing, setIsParsing] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState(() => getApiKey())
  const { user } = useAuth()
  const navigate = useNavigate()

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  function addSection() {
    const lastSection = form.sections[form.sections.length - 1]
    let nextName = `Section ${form.sections.length + 1}`
    
    if (lastSection) {
      const match = lastSection.name.match(/(.*)(\d+|[A-Z])$/)
      if (match) {
        const prefix = match[1]
        const suffix = match[2]
        if (isNaN(suffix)) {
          // It's a letter
          nextName = `${prefix}${String.fromCharCode(suffix.charCodeAt(0) + 1)}`
        } else {
          // It's a number
          nextName = `${prefix}${parseInt(suffix) + 1}`
        }
      }
    }

    updateField('sections', [
      ...form.sections,
      { id: crypto.randomUUID(), name: nextName, subject: lastSection?.subject || 'General', positiveMarks: lastSection?.positiveMarks || 4, negativeMarks: lastSection?.negativeMarks || 1 },
    ])
  }


  function updateSection(id, field, value) {
    updateField('sections', form.sections.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  function removeSection(id) {
    if (form.sections.length <= 1) return
    updateField('sections', form.sections.filter((s) => (s.id !== id)))
  }

  async function handleParse() {
    setIsParsing(true)
    const result = await parsePaperFile(file, form.answerMode)
    setQuestions(result.questions)
    setPageImages(result.pageImages || [])
    setParserNote(result.parserNote)
    setIsParsing(false)
  }

  function updateQuestion(index, field, value) {
    setQuestions((current) =>
      current.map((question, questionIndex) => (questionIndex === index ? { ...question, [field]: value } : question)),
    )
  }

  function updateOption(questionIndex, optionIndex, value) {
    setQuestions((current) =>
      current.map((question, currentQuestionIndex) =>
        currentQuestionIndex === questionIndex
          ? { ...question, options: question.options.map((option, currentOptionIndex) => (currentOptionIndex === optionIndex ? value : option)) }
          : question,
      ),
    )
  }

  function updateQuestionType(questionIndex, type) {
    setQuestions((current) =>
      current.map((question, currentQuestionIndex) => {
        if (currentQuestionIndex !== questionIndex) return question
        return {
          ...question,
          type: 'mcq',
          options: (question.options && question.options.length > 0) ? question.options : ['', '', '', ''],
          correctAnswer: undefined,
        }
      }),
    )
  }

  function handleQuestionImage(questionIndex, imageFile) {
    if (!imageFile) return

    const reader = new FileReader()
    reader.onload = () => {
      updateQuestion(questionIndex, 'diagramUrl', reader.result)
      updateQuestion(questionIndex, 'diagramName', imageFile.name)
    }
    reader.readAsDataURL(imageFile)
  }

  function insertSymbol(questionIndex, symbol) {
    const textarea = document.getElementById(`question-text-${questionIndex}`)
    const question = questions[questionIndex]
    const nextText = insertAtCursor(question.text, symbol, textarea?.selectionStart, textarea?.selectionEnd)
    updateQuestion(questionIndex, 'text', nextText)
    window.requestAnimationFrame(() => textarea?.focus())
  }

  function removeExtractedQuestion(index) {
    if (!window.confirm("Are you sure you want to remove this extracted question?")) return
    setQuestions((current) => current.filter((_, i) => i !== index).map((q, idx) => ({ ...q, number: idx + 1 })))
  }

  function handleSubmit(event) {
    event.preventDefault()
    
    // Enrich questions with section data for easier access
    const enrichedQuestions = questions.map(q => {
      const section = form.sections.find(s => s.id === q.sectionId)
      return {
        ...q,
        sectionName: section?.name,
        sectionSubject: section?.subject,
        marks: q.marks || section?.positiveMarks || 1,
        negativeMarks: section?.negativeMarks ?? form.negativeMarking ?? 0
      }
    })

    const paper = createPaper({
      ...form,
      duration: Number(form.duration),
      totalMarks: Number(form.totalMarks),
      negativeMarking: Number(form.negativeMarking),
      questions: enrichedQuestions,
      userId: user.id,
      sourceFileName: file?.name ?? 'manual upload',
    })
    navigate(`/papers/${paper.id}`)
  }

  const [currentStep, setCurrentStep] = useState(1)

  const steps = [
    { id: 1, label: 'Paper Config' },
    { id: 2, label: 'Attachment' },
    { id: 3, label: 'Extraction' }
  ]

  // ... (previous helper functions remains the same)

  const renderStepProgress = () => (
    <div className="mb-8 flex items-center justify-between md:justify-center md:gap-4 px-2 overflow-x-auto no-scrollbar">
      {steps.map((s, i) => (
        <div className="flex items-center flex-shrink-0" key={s.id}>
          <div className="flex flex-col md:flex-row items-center gap-2">
            <div className={`flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full text-[10px] md:text-xs font-black transition-all ${
              currentStep >= s.id ? 'bg-[#00f5ca] text-white shadow-[0_0_15px_rgba(0,245,202,0.4)]' : 'bg-white/5 text-white/20 border border-white/10'
            }`}>
              {s.id}
            </div>
            <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest ${
              currentStep >= s.id ? 'text-white' : 'text-white/20'
            } hidden sm:block`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`mx-2 md:mx-4 h-[1px] w-6 md:w-12 ${currentStep > s.id ? 'bg-[#00f5ca]' : 'bg-white/10'}`}></div>
          )}
        </div>
      ))}
    </div>
  )


  return (
    <div className="mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
      {renderStepProgress()}

      <div className="glass-main !p-6 md:!p-12 relative overflow-hidden">
        {/* Step 1: Config */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <header className="space-y-2">
              <h2 className="text-3xl font-black text-[var(--text)]">Paper Details</h2>
              <p className="text-[var(--muted)] font-medium">Define the core information for your exam paper.</p>
            </header>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="field">
                <span className="text-[var(--text)]/60">Paper Title</span>
                <input className="input" required value={form.title} placeholder="e.g. JEE Advanced 2024" onChange={(e) => updateField('title', e.target.value)} />
              </label>
              <label className="field">
                <span className="text-[var(--text)]/60">Exam Name</span>
                <input className="input" value={form.examName} placeholder="e.g. Physics Mock" onChange={(e) => updateField('examName', e.target.value)} />
              </label>
              <label className="field">
                <span className="text-[var(--text)]/60">Default Subject</span>
                <input className="input" value={form.subject} placeholder="e.g. Mathematics" onChange={(e) => updateField('subject', e.target.value)} />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="field">
                  <span className="text-[var(--text)]/60">Duration (min)</span>
                  <input className="input" type="number" value={form.duration} onChange={(e) => updateField('duration', e.target.value)} />
                </label>
                <label className="field">
                  <span className="text-[var(--text)]/60">Total Marks</span>
                  <input className="input" type="number" value={form.totalMarks} onChange={(e) => updateField('totalMarks', e.target.value)} />
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button className="btn btn-primary h-14 px-10 text-lg" onClick={() => setCurrentStep(2)}>
                Continue to Upload
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Attachment */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <header className="space-y-2">
              <h2 className="text-3xl font-black text-[var(--text)]">Files & Sections</h2>
              <p className="text-[var(--muted)] font-medium">Upload your PDF and define marking sections.</p>
            </header>

            <div className="space-y-6">
              <div className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all ${
                file ? 'border-[#00f5ca] bg-[#00f5ca]/5' : 'border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5'
              }`}>
                <input 
                  type="file" 
                  className="absolute inset-0 cursor-pointer opacity-0" 
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0])}
                />
                <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-muted)] transition-transform group-hover:scale-110`}>
                   <svg className="h-8 w-8 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                   </svg>
                </div>
                <p className="text-lg font-bold text-[var(--text)]">{file ? file.name : 'Click or Drag PDF to upload'}</p>
                <p className="mt-1 text-sm text-[var(--muted)] font-medium">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Only structured MCQ PDFs supported'}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-widest text-[var(--accent)]">Sections & Marking</h3>
                  <button className="btn btn-secondary !h-9 px-4 text-xs font-black uppercase" onClick={addSection}>+ Add</button>
                </div>
                <div className="space-y-3">
                  {form.sections.map((section) => (
                    <div key={section.id} className="grid grid-cols-2 md:grid-cols-[1fr_1fr_80px_80px_auto] gap-4 items-center rounded-xl bg-[var(--surface-muted)] p-4 border border-[var(--border)]">
                      <input className="bg-transparent text-sm font-bold text-[var(--text)] outline-none placeholder:text-[var(--muted)]/40 col-span-2 md:col-span-1" value={section.name} placeholder="Section Name" onChange={e => updateSection(section.id, 'name', e.target.value)} />
                      <input className="bg-transparent text-sm font-bold text-[var(--text)]/60 outline-none placeholder:text-[var(--muted)]/40 col-span-2 md:col-span-1" value={section.subject} placeholder="Subject" onChange={e => updateSection(section.id, 'subject', e.target.value)} />
                      <div className="flex flex-col gap-1 items-center">
                        <span className="text-[8px] uppercase text-[var(--muted)] font-black">Pos</span>
                        <input type="number" className="bg-transparent text-sm font-bold text-[var(--text)] text-center outline-none w-full" value={section.positiveMarks} onChange={e => updateSection(section.id, 'positiveMarks', Number(e.target.value))} />
                      </div>
                      <div className="flex flex-col gap-1 items-center">
                        <span className="text-[8px] uppercase text-[var(--muted)] font-black">Neg</span>
                        <input type="number" className="bg-transparent text-sm font-bold text-[var(--text)] text-center outline-none w-full" value={section.negativeMarks} onChange={e => updateSection(section.id, 'negativeMarks', Number(e.target.value))} />
                      </div>
                      <button className="text-[var(--muted)] hover:text-red-400 transition-colors col-span-2 md:col-span-1 border-t md:border-none pt-2 md:pt-0" onClick={() => removeSection(section.id)}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
              <button className="text-[var(--muted)] font-bold hover:text-[var(--text)] transition-colors" onClick={() => setCurrentStep(1)}>Back</button>
              <button className="btn btn-primary h-14 px-10 text-lg" disabled={!file} onClick={async () => {
                await handleParse();
                setCurrentStep(3);
              }}>
                {isParsing ? 'Processing...' : 'Extract Questions'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Extraction & Review */}
        {currentStep === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <header className="space-y-2">
              <h2 className="text-3xl font-black text-[var(--text)]">Review Extraction</h2>
              <p className="text-[var(--muted)] font-medium">Verified {questions.length} questions. Finalize details before saving.</p>
            </header>

            <div className="space-y-6 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
              {questions.map((question, idx) => (
                <div key={question.id} className="metric !p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">Q{idx + 1} • {question.type}</span>
                    <button onClick={() => removeExtractedQuestion(idx)} className="text-[var(--muted)] hover:text-red-400 transition-colors">✕</button>
                  </div>
                  <textarea 
                    className="w-full bg-transparent text-[var(--text)] font-medium outline-none resize-none min-h-[80px]"
                    value={question.text}
                    onChange={(e) => updateQuestion(idx, 'text', e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2">
                    {question.options.map((opt, i) => (
                      <div key={i} className={`flex-1 min-w-[120px] rounded-lg border p-3 transition-all ${
                        question.correctOption === i ? 'border-[var(--accent)] bg-[var(--accent)]/10' : 'border-[var(--border)] bg-[var(--surface-muted)]'
                      }`}>
                         <span className="text-[10px] font-black text-[var(--muted)]/50 mr-2">{String.fromCharCode(65 + i)}</span>
                         <input className="bg-transparent text-xs font-bold text-[var(--text)] outline-none w-full inline" value={opt} onChange={(e) => updateOption(idx, i, e.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
              <button className="text-[var(--muted)] font-bold hover:text-[var(--text)] transition-colors" onClick={() => setCurrentStep(2)}>Back</button>
              <button className="btn btn-primary h-14 px-10 text-lg shadow-[0_0_30px_rgba(0,245,202,0.3)]" onClick={handleSubmit}>
                Save & Initialize Paper
              </button>
            </div>
          </div>
        )}

      </div>

      {snippingIndex !== null && (
        <PdfSnipper 
          pageImage={pageImages[questions[snippingIndex].pageNumber - 1]} 
          onCapture={(dataUrl) => {
            updateQuestion(snippingIndex, 'diagramUrl', dataUrl)
            setSnippingIndex(null)
          }}
          onClose={() => setSnippingIndex(null)}
        />
      )}
    </div>
  )
}

export default UploadPaper
