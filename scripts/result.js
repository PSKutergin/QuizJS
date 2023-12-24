const result = () => {
    const Result = {
        showAnswersButtonElement: null,
        init() {
            const user = JSON.parse(sessionStorage.getItem('user'));

            document.getElementById('result-score').innerText = user.score + '/' + user.total;

            this.showAnswersButtonElement = document.getElementById('show');
            this.showAnswersButtonElement.onclick = function () {
                location.href = 'right.html';
            }
        },
    };

    Result.init();
};

result();