export const answerModes = {
  WITH_KEY: 'with-key',
  WITHOUT_KEY: 'without-key',
}

export const sampleTopics = ['Algebra', 'Reasoning', 'English', 'General Science']

export const emptyPaperForm = {
  title: '',
  subject: '',
  examName: '',
  duration: 180,
  totalMarks: 300,
  negativeMarking: 0,
  answerMode: answerModes.WITH_KEY,
  sections: [
    { id: crypto.randomUUID(), name: 'Section A', subject: 'General', positiveMarks: 4, negativeMarks: 1 },
  ],
}
