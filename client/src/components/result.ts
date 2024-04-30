import config from "../config/config";
import { Auth } from "../services/auth";
import { CustomHttp } from "../services/custom-http";
import { DefaultResponseType } from "../types/default-response.type";
import { PassTestResponseType } from "../types/pass-test-response.type";
import { UserInfoType } from "../types/user-info.type";

export class Result {
    private showAnswersButtonElement: HTMLElement | null = null;
    private resultScoreElement: HTMLElement | null = null;

    constructor() {
        this.resultScoreElement = document.getElementById('result-score');
        this.showAnswersButtonElement = document.getElementById('show');

        if (this.showAnswersButtonElement) this.showAnswersButtonElement.onclick = function () {
            location.href = '#/right';
        }
        this.init();
    }

    private async init(): Promise<void> {
        const userInfo: UserInfoType | null = Auth.getUserInfo();

        if (!userInfo) {
            location.href = '#/';
            return;
        }

        if (userInfo.testId) {
            try {
                const result: DefaultResponseType | PassTestResponseType = await CustomHttp.request(config.host + '/tests/' + userInfo.testId + '/result?userId=' + userInfo.userId);

                if (result) {
                    if ((result as DefaultResponseType).error !== undefined) {
                        throw new Error((result as DefaultResponseType).message);
                    }

                    if (this.resultScoreElement) this.resultScoreElement.innerText = (result as PassTestResponseType).score + '/' + (result as PassTestResponseType).total;
                    return
                }

            } catch (error) {
                console.log(error);
            }
        }

        location.href = '#/';
    }
};