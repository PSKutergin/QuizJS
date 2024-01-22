import { CustomHttp } from '../services/custom-http.js';
import config from '../config/config.js';
import { Auth } from '../services/auth.js';

export class Choice {
    constructor() {
        this.quizzes = [];
        this.restResult = null;
        this.init()
    }

    async init() {
        try {
            const result = await CustomHttp.request(config.host + '/tests');

            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }

                this.quizzes = result;
            }

        } catch (error) {
            return console.log(error);
        }

        const userInfo = Auth.getUserInfo();
        if (userInfo) {
            try {
                const result = await CustomHttp.request(config.host + '/tests/results?userId=' + userInfo.userId);

                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }

                    this.restResult = result;
                }

            } catch (error) {
                return console.log(error);
            }
        }

        this.processQuizzes();
    }

    processQuizzes() {
        if (this.quizzes && this.quizzes.length > 0) {
            const choiceOptionsElement = document.getElementById('choice-options');

            this.quizzes.forEach(quiz => {
                const that = this;
                const choiceOptionElement = document.createElement('section');
                choiceOptionElement.className = 'choice-option';
                choiceOptionElement.setAttribute('data-id', quiz.id);
                choiceOptionElement.onclick = function () {
                    that.chooseQuiz(this);
                };

                const choiceOptionTextElement = document.createElement('section');
                choiceOptionTextElement.className = 'choice-option-text';
                choiceOptionTextElement.innerText = quiz.name;

                const choiceOptionArrowElement = document.createElement('section');
                choiceOptionArrowElement.className = 'choice-option-arrow';

                const result = this.restResult.find(item => item.testId === quiz.id);
                if (result) {
                    const choiceOptionResultElement = document.createElement('section');
                    choiceOptionResultElement.className = 'choice-option-result';
                    choiceOptionResultElement.innerHTML = `
                        <section>Результат</section>
                        <section>${result.score}/${result.total}</section>
                    `;
                    choiceOptionElement.appendChild(choiceOptionResultElement);
                }

                const choiceOptionImageElement = document.createElement('img');
                choiceOptionImageElement.setAttribute('src', 'assets/images/arrow.png');
                choiceOptionImageElement.setAttribute('alt', 'Arrow');

                choiceOptionArrowElement.appendChild(choiceOptionImageElement);
                choiceOptionElement.appendChild(choiceOptionTextElement);
                choiceOptionElement.appendChild(choiceOptionArrowElement);

                choiceOptionsElement.appendChild(choiceOptionElement);
            });
        };
    }

    chooseQuiz(element) {
        const dataId = element.getAttribute('data-id');
        const userInfo = Auth.getUserInfo();

        if (dataId) {
            userInfo.testId = dataId;
            Auth.setUserInfo(userInfo);
            location.href = '#/test';
        }
    }
};