import config from "../config/config.js";
import { Auth } from "../services/auth.js";
import { CustomHttp } from "../services/custom-http.js";

export class Result {
    showAnswersButtonElement = null;
    resultScoreElement = null;

    constructor() {
        this.resultScoreElement = document.getElementById('result-score');
        this.showAnswersButtonElement = document.getElementById('show');

        this.showAnswersButtonElement.onclick = function () {
            location.href = '#/right';
        }
        this.init();
    }

    async init() {
        const userInfo = Auth.getUserInfo();

        if (!userInfo) {
            location.href = '#/';
            return;
        }

        if (userInfo.testId) {
            try {
                const result = await CustomHttp.request(config.host + '/tests/' + userInfo.testId + '/result?userId=' + userInfo.userId);

                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }

                    this.resultScoreElement.innerText = result.score + '/' + result.total;
                    return
                }

            } catch (error) {
                console.log(error);
            }
        }

        location.href = '#/';
    }
};