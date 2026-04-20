import { sampleTopics } from './constants.js'

export function buildSampleQuestions(sourceName = 'practice-paper.pdf') {
  return [
    {
      id: crypto.randomUUID(),
      type: 'mcq',
      text: `From ${sourceName}, choose the option that best completes the given sequence: 4, 9, 19, 39, ?`,
      options: ['59', '69', '79', '89'],
      topic: sampleTopics[1],
      marks: 1,
      correctOption: 2,
    },
    {
      id: crypto.randomUUID(),
      type: 'numerical',
      text: 'If x + 1/x = 5, what is the value of x² + 1/x²?',
      options: [],
      topic: sampleTopics[0],
      marks: 1,
      correctAnswer: '23',
      answerTolerance: 0,
    },
    {
      id: crypto.randomUUID(),
      type: 'mcq',
      text: 'Select the grammatically correct sentence.',
      options: [
        'Each of the students have a hall ticket.',
        'Each of the students has a hall ticket.',
        'Each students has a hall ticket.',
        'Each student have a hall ticket.',
      ],
      topic: sampleTopics[2],
      marks: 1,
      correctOption: 1,
    },
    {
      id: crypto.randomUUID(),
      type: 'mcq',
      text: 'Which gas is released during photosynthesis?',
      options: ['Carbon dioxide', 'Oxygen', 'Nitrogen', 'Hydrogen'],
      topic: sampleTopics[3],
      marks: 1,
      correctOption: 1,
    },
  ]
}

export function stripAnswersForNoKey(questions) {
  return questions.map((question) => {
    const nextQuestion = { ...question }
    delete nextQuestion.correctOption
    delete nextQuestion.correctAnswer
    return nextQuestion
  })
}
