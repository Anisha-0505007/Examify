function isQuestionKeyed(question) {
  return Number.isInteger(question.correctOption)
}

function hasAttempted(value) {
  return value !== undefined && value !== null && String(value).trim() !== ''
}

function isAnswerCorrect(question, selected) {
  if (!isQuestionKeyed(question) || !hasAttempted(selected)) {
    return false
  }

  return selected === question.correctOption
}

export function scoreAttempt(paper, attempt) {
  const questions = paper.questions ?? []
  const negative = Number(paper.negativeMarking) || 0
  const breakdown = questions.map((question, index) => {
    const selected = attempt.answers?.[question.id]
    const hasKey = isQuestionKeyed(question)
    const isAttempted = hasAttempted(selected)
    const isCorrect = isAnswerCorrect(question, selected)
    const isIncorrect = hasKey && isAttempted && !isCorrect
    const qNegative = typeof question.negativeMarks === 'number' ? question.negativeMarks : negative
    const score = isCorrect ? question.marks ?? 1 : isIncorrect ? -qNegative : 0

    return {
      questionId: question.id,
      number: index + 1,
      topic: question.topic || 'General',
      selected,
      correctOption: question.correctOption,
      correctAnswer: question.correctAnswer,
      isAttempted,
      isCorrect,
      isIncorrect,
      score,
    }
  })

  const correct = breakdown.filter((item) => item.isCorrect).length
  const incorrect = breakdown.filter((item) => item.isIncorrect).length
  const attempted = breakdown.filter((item) => item.isAttempted).length
  const unattempted = questions.length - attempted
  const totalScore = breakdown.reduce((sum, item) => sum + item.score, 0)
  const maxScore = questions.reduce((sum, question) => sum + (question.marks ?? 1), 0)
  const topicStats = breakdown.reduce((acc, item) => {
    const current = acc[item.topic] ?? { topic: item.topic, total: 0, correct: 0, incorrect: 0 }
    current.total += 1
    current.correct += item.isCorrect ? 1 : 0
    current.incorrect += item.isIncorrect ? 1 : 0
    acc[item.topic] = current
    return acc
  }, {})

  return {
    hasKey: questions.some((question) => isQuestionKeyed(question)),
    correct,
    incorrect,
    attempted,
    unattempted,
    totalQuestions: questions.length,
    totalKeyed: questions.filter(isQuestionKeyed).length,
    totalScore,
    maxScore,
    breakdown,
    weakTopics: Object.values(topicStats)
      .filter((topic) => topic.incorrect > 0 || topic.correct === 0)
      .sort((a, b) => b.incorrect - a.incorrect),
  }
}
