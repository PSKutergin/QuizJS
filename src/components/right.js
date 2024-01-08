import { checkUserData } from '../utils/common.js';

export class Right {
    constructor() {
        this.quiz = null;
        this.answers = null;
        this.questionsElement = null;

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

                xhr.open('GET', 'https://testologia.site/get-quiz-right?id=' + user.testId, false);
                xhr.send();

                if (xhr.status === 200 && xhr.responseText) {
                    try {
                        this.answers = JSON.parse(xhr.responseText)
                    } catch (error) {
                        location.href = '#/'
                    }

                    this.renderData(user);
                } else {
                    location.href = '#/'
                }
            } else {
                location.href = '#/'
            }
        } else {
            location.href = '#/';
        }
    }

    renderData(user) {
        this.questionsElement = document.getElementById('questions');

        document.getElementById('test-title').innerText = this.quiz.name;
        document.getElementById('user').innerText = `${user.name} ${user.lastName}, ${user.email}`;

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

            const userAnswer = user.results.find(result => result.questionId === question.id);

            question.answers.forEach(answer => {
                const answerElement = document.createElement('section');
                answerElement.className = 'right-question-option';

                const answerCircleElement = document.createElement('section');
                answerCircleElement.className = 'right-progress-bar-item-circle';

                const answerTextElement = document.createElement('section');
                answerTextElement.className = 'right-progress-bar-item-text';
                answerTextElement.innerText = answer.answer;

                if (userAnswer) {
                    if (answer.id === userAnswer.chosenAnswerId && userAnswer.chosenAnswerId === this.answers[index]) {
                        answerElement.classList.add('right');
                    } else if ((answer.id === userAnswer.chosenAnswerId && userAnswer.chosenAnswerId !== this.answers[index])) {
                        answerElement.classList.add('wrong');
                    }
                };

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