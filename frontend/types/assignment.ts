export type Difficulty = 'Easy' | 'Moderate' | 'Hard'
export type AssignmentStatus = 'pending' | 'processing' | 'complete' | 'error'

export interface IQuestion {
  id: string
  text: string
  type: string
  difficulty: Difficulty
  marks: number
  answerKey: string
  options?: string[]
}

export interface ISection {
  id: string
  title: string
  instruction: string
  questions: IQuestion[]
}

export interface IGeneratedContent {
  sections: ISection[]
  totalMarks: number
  totalQuestions: number
  timeAllowed: number
}

export interface QuestionConfigItem {
  type: string
  label: string
  count: number
  marksEach: number
}

export type QuestionConfig = QuestionConfigItem[]

export interface AssignmentListItem {
  _id: string
  name: string
  subject: string
  className: string
  dueDate: string
  status: AssignmentStatus
  createdAt: string
}

export interface AssignmentDetail extends AssignmentListItem {
  schoolName?: string
  additionalInstructions: string
  questionConfig: QuestionConfig
  generatedContent?: IGeneratedContent
  errorMessage?: string
  updatedAt: string
}

export interface PaginationData {
  total: number
  page: number
  limit: number
  totalPages: number
}
