import config from "../config/config.js";
import { Auth } from "../services/auth.js";
import { CustomHttp } from "../services/custom-http.js";

export class Right {
    constructor() {
        this.quiz = null;
        this.questionsElement = null;
        this.userInfo = null;
        this.init();
    }

    async init() {
        this.userInfo = Auth.getUserInfo();

        if (this.userInfo) {
            try {
                const result = await CustomHttp.request(config.host + '/tests/' + this.userInfo.testId + '/result/details?userId=' + this.userInfo.userId);

                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }

                    this.quiz = result.test;
                    this.renderData()
                }

            } catch (error) {
                console.log(error);
            }
        } else {
            location.href = '#/';
        }
    }

    renderData() {
        this.questionsElement = document.getElementById('questions');

        document.getElementById('test-title').innerText = this.quiz.name;
        document.getElementById('user').innerText = `${this.userInfo.fullName}, ${this.userInfo.email}`;

        this.quiz.questions.forEach((question, index) => {
            const questionId = index + 1;

            const questionElement = document.createElement('section');
            questionElement.className = 'right-question';

            const questionTitleElement = document.createElement('section');
            questionTitleElement.className = 'right-question-title';
            questionTitleElement.innerHTML = `
                    <span>Вопрос ${questionId}:</span> ${question.question}
                `;

            const answerOptionsElement = document.createElement('section');
            answerOptionsElement.className = 'right-question-options';

            question.answers.forEach(currentAnswer => {
                const answerElement = document.createElement('section');
                answerElement.className = 'right-question-option';

                const answerCircleElement = document.createElement('section');
                answerCircleElement.className = 'right-progress-bar-item-circle';

                const answerTextElement = document.createElement('section');
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
            this.questionsElement.appendChild(questionElement);
        });

        Array.from(document.querySelectorAll('.back-to-results')).forEach(elem => {
            elem.onclick = function () {
                location.href = '#/result';
            }
        })
    }
};