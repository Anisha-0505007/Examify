import { answerModes } from '../utils/constants.js'
import { buildSampleQuestions, stripAnswersForNoKey } from '../utils/questionTransform.js'
import { hasSymbolArtifacts } from '../utils/symbols.js'
import { fixQuestionTextWithAI, getApiKey } from './aiService.js'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

const optionMarker = /(?:^|[^\w])(?:\(([A-Da-d1-4])\s*\*?\s*\)|([A-Da-d1-4])\s*\*?\s*[).])(?:\s+|$|(?=[^\w\s]))/gi

function repairMangledText(text) {
  // Common mappings for mangled symbols in Science/Math PDFs
  return text
    .replace(/□\s*□/g, 'π') // Double box often maps to pi
    .replace(/\?\s*\?/g, '±') // Double question often maps to plus-minus
    .replace(/sin\s*[□\?]/gi, 'sin θ')
    .replace(/cos\s*[□\?]/gi, 'cos θ')
    .replace(/tan\s*[□\?]/gi, 'tan θ')
    .replace(/([0-9t])\s*[□\?]\s*([0-9t])/g, '$1 + $2') // expanded
    .replace(/λ\s*[□\?]/g, 'λ =') // Lambda box often lambda =
    .replace(/=\s*[□\?]/g, '= ') // redundant but safe
    .replace(/[□\?]\s*is\s*:/g, 'θ is :')
    .replace(/phase\s*[□\?]/gi, 'phase φ')
    .replace(/frequency\s*[□\?]/gi, 'frequency f')
    .replace(/velocity\s*[□\?]/gi, 'velocity v')
    .replace(/([0-9])m\s*[□\?]\s*[□\?]/gi, '$1m/s') // m box box often m/s
    .replace(/([0-9])s\s*[□\?]\s*[□\?]/gi, '$1s⁻¹')
}

function cleanText(value) {
  const repaired = repairMangledText(value)
  return repaired.replace(/\s+/g, ' ').trim()
}

function getQuestionBlocks(text) {
  const normalized = text.replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ')
  const questionStart = /(?:^|\s)(?:Q(?:uestion)?\.?\s*\d{1,3}[).\s]+|\d{1,3}[).]\s+)/gi
  const matches = [...normalized.matchAll(questionStart)]

  if (matches.length === 0) {
    return []
  }

  return matches
    .map((match, index) => {
      const start = match.index + match[0].search(/\S/)
      const end = matches[index + 1]?.index ?? normalized.length
      return normalized.slice(start, end)
    })
    .filter((block) => cleanText(block).length > 12)
}

function questionHasArtifacts(question) {
  return hasSymbolArtifacts(question.text) || question.options?.some((option) => hasSymbolArtifacts(option))
}

function parseMcqBlock(block, number, pageNumber) {
  const markers = [...block.matchAll(optionMarker)]

  if (markers.length < 2) {
    return null
  }

  const questionStart = block.match(/^(?:Q(?:uestion)?\.?\s*\d{1,3}[).\s]+|\d{1,3}[).]\s*)/i)?.[0]?.length ?? 0
  const text = cleanText(block.slice(questionStart, markers[0].index))
  const options = markers.map((marker, index) => {
    const start = marker.index + marker[0].length
    const end = markers[index + 1]?.index ?? block.length
    return cleanText(block.slice(start, end))
  })

  if (!text || options.some((option) => option.length === 0)) {
    return null
  }

  return {
    id: crypto.randomUUID(),
    number,
    pageNumber,
    type: 'mcq',
    text,
    options,
    topic: 'General',
    marks: 1,
  }
}



function parseQuestionsFromText(text, startNumber, pageNumber) {
  return getQuestionBlocks(text)
    .map((block, index) => {
      const questionNumber = startNumber + index
      return parseMcqBlock(block, questionNumber, pageNumber)
    })
    .filter(Boolean)
}

async function renderPageImage(page) {
  const viewport = page.getViewport({ scale: 0.9 })
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  canvas.width = viewport.width
  canvas.height = viewport.height

  await page.render({ canvasContext: context, viewport }).promise

  return canvas.toDataURL('image/jpeg', 0.72)
}

async function extractPdfQuestions(file) {
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  const questions = []
  const pageImages = []
  let questionsWithPageImages = 0

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const pageImageUrl = await renderPageImage(page)
    pageImages.push(pageImageUrl)
    
    const content = await page.getTextContent()
    const text = content.items.map((item) => item.str).join(' ')
    const pageQuestions = parseQuestionsFromText(text, questions.length + 1, pageNumber)
    const hasArtifacts = pageQuestions.some((question) => questionHasArtifacts(question))

    questions.push(
      ...pageQuestions.map((question) => {
        if (!hasArtifacts || !questionHasArtifacts(question)) {
          return question
        }

        questionsWithPageImages += 1

        return {
          ...question,
          diagramUrl: pageImageUrl,
          diagramName: `Original PDF page ${pageNumber}`,
          extractionWarning: 'Symbol placeholders were detected, so the original PDF page image was attached.',
        }
      }),
    )
  }

  return {
    pageCount: pdf.numPages,
    questions,
    pageImages,
    questionsWithPageImages,
  }
}

export async function parsePaperFile(file, answerMode) {
  if (!file) {
    const questions = buildSampleQuestions('manual-paper.pdf')

    return {
      sourceFileName: 'manual-paper.pdf',
      questions: answerMode === answerModes.WITH_KEY ? questions : stripAnswersForNoKey(questions),
      parserNote: 'No PDF selected, so sample questions were loaded for the demo.',
    }
  }

  const { pageCount, questionsWithPageImages, questions, pageImages } = await extractPdfQuestions(file)

  let processedQuestions = questions
  let aiRepairedCount = 0
  const apiKey = getApiKey()

  if (apiKey) {
    processedQuestions = await Promise.all(
      questions.map(async (q) => {
        let isRepaired = false
        const nextQ = { ...q }
        
        if (hasSymbolArtifacts(q.text)) {
          nextQ.text = await fixQuestionTextWithAI(q.text)
          isRepaired = true
        }

        if (nextQ.options) {
          nextQ.options = await Promise.all(
            nextQ.options.map(async (opt) => hasSymbolArtifacts(opt) ? await fixQuestionTextWithAI(opt, nextQ.text) : opt)
          )
        }

        if (isRepaired) {
          aiRepairedCount += 1
          nextQ.extractionWarning = 'Mangled symbols were detected but AI was used to restore the content automatically.'
        }
        
        return nextQ
      })
    )
  }

  const finalQuestions =
    answerMode === answerModes.WITH_KEY
      ? processedQuestions
      : processedQuestions.map((question) => {
          const nextQuestion = { ...question }
          delete nextQuestion.correctOption
          delete nextQuestion.correctAnswer
          return nextQuestion
        })

  let parserNote = questions.length > 0
    ? `Read ${pageCount} PDF pages and detected ${questions.length} question blocks.`
    : `Read ${pageCount} PDF pages but could not detect numbered question blocks. Use a structured PDF with questions like "1." or "Q1.", or add a manual entry step next.`

  if (aiRepairedCount > 0) {
    parserNote += ` AI successfully repaired symbols in ${aiRepairedCount} questions automatically.`
  } else if (questionsWithPageImages > 0 && !apiKey) {
    parserNote += ` Found ${questionsWithPageImages} questions with broken symbols. Enable AI to fix them automatically.`
  }

  return {
    sourceFileName: file.name,
    pageImages,
    questions: finalQuestions,
    parserNote,
  }
}
