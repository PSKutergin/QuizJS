import config from "../config/config";
import { Auth } from "../services/auth";
import { CustomHttp } from "../services/custom-http";
import { DefaultResponseType } from "../types/default-response.type";
import { QuezAnswerType, QuezQuestionType, QuezType } from "../types/quiz.type";
import { UserInfoType } from "../types/user-info.type";

export class Right {
    private quiz: QuezType | null = null;
    private questionsElement: HTMLElement | null = null;
    private userInfo: UserInfoType | null = null;

    constructor() {
        this.init();
    }

    private async init(): Promise<void> {
        this.userInfo = Auth.getUserInfo();

        if (this.userInfo) {
            try {
                const result: DefaultResponseType | any = await CustomHttp.request(config.host + '/tests/' + this.userInfo.testId + '/result/details?userId=' + this.userInfo.userId);

                if (result) {
                    if ((result as DefaultResponseType).error !== undefined) {
                        throw new Error((result as DefaultResponseType).message);
                    }

                    this.quiz = (result).test;
                    this.renderData()
                }

            } catch (error) {
                console.log(error);
            }
        } else {
            location.href = '#/';
        }
    }

    private renderData(): void {
        if (!this.quiz || !this.userInfo) return;
        this.questionsElement = document.getElementById('questions');
        const testTitleElement: HTMLElement | null = document.getElementById('test-title');
        const userElement: HTMLElement | null = document.getElementById('user');

        if (testTitleElement && userElement) {
            testTitleElement.innerText = this.quiz.name;
            userElement.innerText = `${this.userInfo.fullName}, ${this.userInfo.email}`;
        }

        this.quiz.questions.forEach((question: QuezQuestionType, index: number) => {
            const questionId: number = index + 1;

            const questionElement: HTMLElement | null = document.createElement('section');
            questionElement.className = 'right-question';

            const questionTitleElement: HTMLElement | null = document.createElement('section');
            questionTitleElement.className = 'right-question-title';
            questionTitleElement.innerHTML = `
                    <span>Вопрос ${questionId}:</span> ${question.question}
                `;

            const answerOptionsElement: HTMLElement | null = document.createElement('section');
            answerOptionsElement.className = 'right-question-options';

            question.answers.forEach((currentAnswer: QuezAnswerType) => {
                const answerElement: HTMLElement | null = document.createElement('section');
                answerElement.className = 'right-question-option';

                const answerCircleElement: HTMLElement | null = document.createElement('section');
                answerCircleElement.className = 'right-progress-bar-item-circle';

                const answerTextElement: HTMLElement | null = document.createElement('section');
                answerTextElement.className = 'right-progress-bar-item-text';
                answerTextElement.innerText = currentAnswer.answer;

                if (currentAnswer.correct === true) {
                    answerElement.classList.add('right');
                } else if (currentAnswer.correct === false) {
                    answerElement.classList.add('wrong');
                }

                answerElement.appendChild(answerCircleElement);
                answerElement.appendChild(answerTextElement);
                answerOptionsElement.appendChild(answerElement);
            })

            questionElement.appendChild(questionTitleElement);
            questionElement.appendChild(answerOptionsElement);
            if (this.questionsElement) this.questionsElement.appendChild(questionElement);
        });

        Array.from(document.querySelectorAll('.back-to-results')).forEach((elem: Element) => {
            (elem as HTMLElement).onclick = function () {
                location.href = '#/result';
            }
        })
    }
};