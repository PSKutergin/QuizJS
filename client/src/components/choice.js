import { CustomHttp } from '../services/custom-http.js';
import config from '../config/config.js';

export class Choice {
    constructor() {
        this.quizzes = [];

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
                this.processQuizzes();
            }

        } catch (error) {
            console.log(error);
        }
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
        const user = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : {};

        if (dataId) {
            user.testId = dataId;
            sessionStorage.setItem('user', JSON.stringify(user));
            location.href = '#/test';
        }
    }
};