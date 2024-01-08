import { checkUserData } from '../utils/common.js';

export class Test {
    constructor() {
        this.progressBarElement = null;
        this.questionTitleElement = null;
        this.optionsElement = null;
        this.nextButtonElement = null;
        this.passButtonElement = null;
        this.prevButtonElement = null;
        this.quiz = null;
        this.currentQuestionIndex = 1;
        this.userResult = [];

        checkUserData();
        const user = JSON.parse(sessionStorage.getItem('user'));

        if (user.testId) {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://testologia.site/get-quiz?id=' + user.testId, false);
            xhr.send();

            if (xhr.status === 200 && xhr.responseText) {
                try {
                    this.quiz = JSON.parse(xhr.responseText)
                } catch (error) {
                    location.href = '#/'
                }

                this.startQuiz();
            } else {
                location.href = '#/'
            }
        } else {
            location.href = '#/';
        }
    }
    startQuiz() {
        this.progressBarElement = document.getElementById('progress-bar');
        this.questionTitleElement = document.getElementById('title');
        this.optionsElement = document.getElementById('options');
        this.nextButtonElement = document.getElementById('next');
        this.passButtonElement = document.getElementById('pass');
        this.prevButtonElement = document.getElementById('prev');
        document.getElementById('pre-title').innerText = this.quiz.name;

        this.nextButtonElement.onclick = this.move.bind(this, 'next');
        this.passButtonElement.onclick = this.move.bind(this, 'pass');
        this.prevButtonElement.onclick = this.move.bind(this, 'prev');

        this.prepareProgressBar();
        this.showQuestion();

        let seconds = 59;
        const timerElement = document.getElementById('timer');
        const interval = setInterval(function () {
            seconds--;
            timerElement.innerText = seconds;

            if (seconds === 0) {
                clearInterval(interval);
                this.complete();
            }
        }.bind(this), 1000)

    }
    prepareProgressBar() {
        for (let i = 0; i < this.quiz.questions.length; i++) {
            const itemElement = document.createElement('section');
            itemElement.className = 'test-progress-bar-item ' + (i === 0 ? 'active' : '');

            const itemCircleElement = document.createElement('section');
            itemCircleElement.className = 'test-progress-bar-item-circle';

            const itemTextElement = document.createElement('section');
            itemTextElement.className = 'test-progress-bar-item-text';
            itemTextElement.innerText = 'Вопрос ' + (i + 1);

            itemElement.appendChild(itemCircleElement);
            itemElement.appendChild(itemTextElement);

            this.progressBarElement.appendChild(itemElement);
        }
    }
    showQuestion() {
        const that = this;
        const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];
        const chosenOption = this.userResult.find(item => item.questionId === activeQuestion.id)

        this.questionTitleElement.innerHTML = `
                <span>Вопрос ${this.currentQuestionIndex}:</span> ${activeQuestion.question}
            `;
        this.optionsElement.innerHTML = '';

        activeQuestion.answers.forEach(answer => {
            const optionElement = document.createElement('section');
            optionElement.className = 'test-question-option';

            const inputId = 'answer-' + answer.id;
            const inputElement = document.createElement('input');
            inputElement.className = 'option-answer';
            inputElement.setAttribute('id', inputId);
            inputElement.setAttribute('type', 'radio');
            inputElement.setAttribute('name', 'answer');
            inputElement.setAttribute('value', answer.id);

            if (chosenOption && chosenOption.chosenAnswerId === answer.id) {
                inputElement.setAttribute('checked', 'checked');
            }

            inputElement.onchange = function () {
                that.choseAnswer();
            };

            const labelElement = document.createElement('label');
            labelElement.setAttribute('for', inputId);
            labelElement.innerText = answer.answer;

            optionElement.appendChild(inputElement);
            optionElement.appendChild(labelElement);

            this.optionsElement.appendChild(optionElement);
        });

        if (chosenOption && chosenOption.chosenAnswerId) {
            this.nextButtonElement.removeAttribute('disabled');
            this.passButtonElement.setAttribute('disabled', 'disabled')
        } else {
            this.nextButtonElement.setAttribute('disabled', 'disabled')
            this.passButtonElement.removeAttribute('disabled');
        };

        if (this.currentQuestionIndex === this.quiz.questions.length) {
            this.nextButtonElement.innerText = 'Завершить';
        } else {
            this.nextButtonElement.innerText = 'Дальше';
        };

        if (this.currentQuestionIndex > 1) {
            this.prevButtonElement.removeAttribute('disabled');
        } else {
            this.prevButtonElement.setAttribute('disabled', 'disabled')
        };
    }
    choseAnswer() {
        this.nextButtonElement.removeAttribute('disabled');
        this.passButtonElement.setAttribute('disabled', 'disabled');
    }
    move(action) {
        const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];
        const chosenAnswer = Array.from(document.querySelectorAll('.option-answer')).find(element => element.checked);

        let chosenAnswerId = null;

        if (chosenAnswer && chosenAnswer.value) {
            chosenAnswerId = Number(chosenAnswer.value);
        }

        const existingResult = this.userResult.find(item => item.questionId === activeQuestion.id)

        if (existingResult) {
            existingResult.chosenAnswerId = chosenAnswerId
        } else {
            this.userResult.push({
                questionId: activeQuestion.id,
                chosenAnswerId: chosenAnswerId,
            });
        };

        if (action === 'next' || action === 'pass') {
            this.currentQuestionIndex++;
        } else {
            this.currentQuestionIndex--;
        };

        if (this.currentQuestionIndex > this.quiz.questions.length) {
            this.complete();
            return;
        }

        Array.from(this.progressBarElement.children).forEach((item, index) => {
            const currentItemIndex = index + 1;

            item.classList.remove('complete');
            item.classList.remove('active');

            if (currentItemIndex === this.currentQuestionIndex) {
                item.classList.add('active');
            } else if (currentItemIndex < this.currentQuestionIndex) {
                item.classList.add('complete');
            }
        });

        this.showQuestion();
    }
    complete() {
        const user = JSON.parse(sessionStorage.getItem('user'));

        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://testologia.site/pass-quiz?id=' + user.testId, false);
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.send(JSON.stringify({
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            results: this.userResult
        }));

        if (xhr.status === 200 && xhr.responseText) {
            let result = null;

            try {
                result = JSON.parse(xhr.responseText)
            } catch (error) {
                location.href = '#/'
            }

            if (result) {
                user.score = result.score;
                user.total = result.total;
                user.results = this.userResult;
                sessionStorage.setItem('user', JSON.stringify(user));

                location.href = '#/result';
            }
        } else {
            location.href = '#/'
        };

    }
};