import config from "../config/config";
import { Auth } from "../services/auth";
import { CustomHttp } from "../services/custom-http";
import { ActionTestType } from "../types/action-test.type";
import { DefaultResponseType } from "../types/default-response.type";
import { PassTestResponseType } from "../types/pass-test-response.type";
import { QuezAnswerType, QuezQuestionType, QuezType } from "../types/quiz.type";
import { UserInfoType } from "../types/user-info.type";
import { userResultType } from "../types/user-result.type";

export class Test {
    private progressBarElement: HTMLElement | null = null;
    private questionTitleElement: HTMLElement | null = null;
    private optionsElement: HTMLElement | null = null;
    private nextButtonElement: HTMLElement | null = null;
    private passButtonElement: HTMLElement | null = null;
    private prevButtonElement: HTMLElement | null = null;
    private quiz: QuezType | null = null;
    private interval: number = 0;
    private currentQuestionIndex: number = 1;
    private userResult: userResultType[] = [];

    constructor() {
        this.init()
    }

    private async init(): Promise<void> {
        const userInfo: UserInfoType | null = Auth.getUserInfo();

        if (userInfo) {
            try {
                const result: DefaultResponseType | QuezType = await CustomHttp.request(config.host + '/tests/' + userInfo.testId);

                if (result) {
                    if ((result as DefaultResponseType).error !== undefined) {
                        throw new Error((result as DefaultResponseType).message);
                    }

                    this.quiz = result as QuezType;
                    this.startQuiz();
                }

            } catch (error) {
                console.log(error);
                return;
            }
        }
    }
    private startQuiz(): void {
        if (!this.quiz) return;

        this.progressBarElement = document.getElementById('progress-bar');
        this.questionTitleElement = document.getElementById('title');
        this.optionsElement = document.getElementById('options');
        this.nextButtonElement = document.getElementById('next');
        this.passButtonElement = document.getElementById('pass');
        this.prevButtonElement = document.getElementById('prev');

        const preTitleElement: HTMLElement | null = document.getElementById('pre-title');
        if (preTitleElement) preTitleElement.innerText = this.quiz.name;

        if (this.nextButtonElement) this.nextButtonElement.onclick = this.move.bind(this, ActionTestType.next);
        if (this.passButtonElement) this.passButtonElement.onclick = this.move.bind(this, ActionTestType.pass);
        if (this.prevButtonElement) this.prevButtonElement.onclick = this.move.bind(this, ActionTestType.prev);

        this.prepareProgressBar();
        this.showQuestion();

        let seconds = 59;
        const that: Test = this;
        const timerElement: HTMLElement | null = document.getElementById('timer');
        this.interval = window.setInterval(function () {
            seconds--;
            if (timerElement) timerElement.innerText = seconds.toString();

            if (seconds === 0) {
                clearInterval(that.interval);
                that.complete();
            }
        }.bind(this), 1000)

    }
    private prepareProgressBar(): void {
        if (!this.quiz) return;

        for (let i = 0; i < this.quiz.questions.length; i++) {
            const itemElement: HTMLElement | null = document.createElement('section');
            itemElement.className = 'test-progress-bar-item ' + (i === 0 ? 'active' : '');

            const itemCircleElement: HTMLElement | null = document.createElement('section');
            itemCircleElement.className = 'test-progress-bar-item-circle';

            const itemTextElement: HTMLElement | null = document.createElement('section');
            itemTextElement.className = 'test-progress-bar-item-text';
            itemTextElement.innerText = 'Вопрос ' + (i + 1);

            itemElement.appendChild(itemCircleElement);
            itemElement.appendChild(itemTextElement);

            if (this.progressBarElement) this.progressBarElement.appendChild(itemElement);
        }
    }
    private showQuestion(): void {
        if (!this.quiz) return;

        const that = this;
        const activeQuestion: QuezQuestionType = this.quiz.questions[this.currentQuestionIndex - 1];
        const chosenOption: userResultType | undefined = this.userResult.find(item => item.questionId === activeQuestion.id)

        if (this.questionTitleElement) this.questionTitleElement.innerHTML = `
                <span>Вопрос ${this.currentQuestionIndex}:</span> ${activeQuestion.question}
            `;
        if (this.optionsElement) this.optionsElement.innerHTML = '';

        activeQuestion.answers.forEach((answer: QuezAnswerType) => {
            const optionElement: HTMLElement | null = document.createElement('section');
            optionElement.className = 'test-question-option';

            const inputId: string = 'answer-' + answer.id;
            const inputElement: HTMLElement | null = document.createElement('input');
            inputElement.className = 'option-answer';
            inputElement.setAttribute('id', inputId);
            inputElement.setAttribute('type', 'radio');
            inputElement.setAttribute('name', 'answer');
            inputElement.setAttribute('value', answer.id.toString());

            if (chosenOption && chosenOption.chosenAnswerId === answer.id) {
                inputElement.setAttribute('checked', 'checked');
            }

            inputElement.onchange = function () {
                that.choseAnswer();
            };

            const labelElement: HTMLElement | null = document.createElement('label');
            labelElement.setAttribute('for', inputId);
            labelElement.innerText = answer.answer;

            optionElement.appendChild(inputElement);
            optionElement.appendChild(labelElement);

            if (this.optionsElement) this.optionsElement.appendChild(optionElement);
        });

        if (this.nextButtonElement && this.passButtonElement) {
            if (chosenOption && chosenOption.chosenAnswerId) {
                this.nextButtonElement.removeAttribute('disabled');
                this.passButtonElement.setAttribute('disabled', 'disabled')
            } else {
                this.nextButtonElement.setAttribute('disabled', 'disabled')
                this.passButtonElement.removeAttribute('disabled');
            };
        }

        if (this.nextButtonElement) {
            if (this.currentQuestionIndex === this.quiz.questions.length) {
                this.nextButtonElement.innerText = 'Завершить';
            } else {
                this.nextButtonElement.innerText = 'Дальше';
            };
        }

        if (this.prevButtonElement) {
            if (this.currentQuestionIndex > 1) {
                this.prevButtonElement.removeAttribute('disabled');
            } else {
                this.prevButtonElement.setAttribute('disabled', 'disabled')
            };
        }
    }
    private choseAnswer(): void {
        if (this.nextButtonElement) this.nextButtonElement.removeAttribute('disabled');
        if (this.passButtonElement) this.passButtonElement.setAttribute('disabled', 'disabled');
    }

    private move(action: ActionTestType): void {
        if (!this.quiz) return;

        const activeQuestion: QuezQuestionType = this.quiz.questions[this.currentQuestionIndex - 1];
        const chosenAnswer: HTMLInputElement | undefined = Array.from(document.querySelectorAll('.option-answer')).find(element => (element as HTMLInputElement).checked) as HTMLInputElement;

        let chosenAnswerId: number | null = null;

        if (chosenAnswer && chosenAnswer.value) {
            chosenAnswerId = Number(chosenAnswer.value);
        }

        const existingResult: userResultType | undefined = this.userResult.find(item => item.questionId === activeQuestion.id)

        if (chosenAnswerId) {
            if (existingResult) {
                existingResult.chosenAnswerId = chosenAnswerId
            } else {
                this.userResult.push({
                    questionId: activeQuestion.id,
                    chosenAnswerId: chosenAnswerId,
                });
            };
        }

        if (action === ActionTestType.next || action === ActionTestType.pass) {
            this.currentQuestionIndex++;
        } else {
            this.currentQuestionIndex--;
        };

        if (this.currentQuestionIndex > this.quiz.questions.length) {
            clearInterval(this.interval);
            this.complete();
            return;
        }

        if (this.progressBarElement) {
            Array.from(this.progressBarElement.children).forEach((item: Element, index: number) => {
                const currentItemIndex = index + 1;

                item.classList.remove('complete');
                item.classList.remove('active');

                if (currentItemIndex === this.currentQuestionIndex) {
                    item.classList.add('active');
                } else if (currentItemIndex < this.currentQuestionIndex) {
                    item.classList.add('complete');
                }
            });
        }

        this.showQuestion();
    }
    private async complete(): Promise<void> {
        const userInfo: UserInfoType | null = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/';
            return;
        }

        try {
            const result: DefaultResponseType | PassTestResponseType = await CustomHttp.request(config.host + '/tests/' + userInfo.testId + '/pass', 'POST', {
                userId: userInfo.userId,
                results: this.userResult
            });

            if (result) {
                if ((result as DefaultResponseType).error !== undefined) {
                    throw new Error((result as DefaultResponseType).message);
                }

                location.href = '#/result';
            }

        } catch (error) {
            console.log(error);
        }
    }
};