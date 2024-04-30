export type QuezType = {
    id: number,
    name: string,
    questions: Array<QuezQuestionType>
}

export type QuezQuestionType = {
    id: number,
    question: string,
    answers: Array<QuezAnswerType>
}

export type QuezAnswerType = {
    id: number,
    answer: string
    correct?: boolean
}