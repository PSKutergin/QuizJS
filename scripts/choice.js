const choice = () => {
    const Choice = {
        quizzes: [],
        init() {
            checkUserData();

            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://testologia.site/get-quizzes', false);
            xhr.send();

            if (xhr.status === 200 && xhr.responseText) {
                try {
                    this.quizzes = JSON.parse(xhr.responseText)
                } catch (error) {
                    location.href = 'index.html'
                }

                this.processQuizzes();
            } else {
                location.href = 'index.html'
            }
        },
        processQuizzes() {
            const choiceOptionsElement = document.getElementById('choice-options');

            if (this.quizzes && this.quizzes.length > 0) {
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
                    choiceOptionImageElement.setAttribute('src', './assets/images/arrow.png');
                    choiceOptionImageElement.setAttribute('alt', 'Arrow');

                    choiceOptionArrowElement.appendChild(choiceOptionImageElement);
                    choiceOptionElement.appendChild(choiceOptionTextElement);
                    choiceOptionElement.appendChild(choiceOptionArrowElement);

                    choiceOptionsElement.appendChild(choiceOptionElement);
                });
            };
        },
        chooseQuiz(element) {
            const dataId = element.getAttribute('data-id');
            const user = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : {};

            if (dataId) {
                user.testId = dataId;
                sessionStorage.setItem('user', JSON.stringify(user));
                location.href = 'test.html';
            }
        },
    };

    Choice.init();
};

choice();