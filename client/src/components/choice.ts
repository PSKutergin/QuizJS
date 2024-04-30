import { CustomHttp } from '../services/custom-http';
import config from '../config/config';
import { Auth } from '../services/auth';
import { QuezListType } from '../types/quiz-list.type';
import { TestResultType } from '../types/test-result.type';
import { UserInfoType } from '../types/user-info.type';
import { DefaultResponseType } from '../types/default-response.type';

export class Choice {
    private quizzes: QuezListType[] = [];
    private restResult: TestResultType[] | null = null;

    constructor() {
        this.init()
    }

    private async init(): Promise<void> {
        try {
            this.quizzes = await CustomHttp.request(config.host + '/tests');
        } catch (error) {
            console.log(error);
            return;
        }

        const userInfo: UserInfoType | null = Auth.getUserInfo();
        if (userInfo) {
            try {
                const result: TestResultType[] | DefaultResponseType = await CustomHttp.request(config.host + '/tests/results?userId=' + userInfo.userId);

                if (result) {
                    if ((result as DefaultResponseType).error !== undefined) {
                        throw new Error((result as DefaultResponseType).message);
                    }

                    this.restResult = result as TestResultType[];
                }

            } catch (error) {
                console.log(error);
                return;
            }
        }

        this.processQuizzes();
    }

    private processQuizzes(): void {
        const choiceOptionsElement: HTMLElement | null = document.getElementById('choice-options');
        if (this.quizzes && this.quizzes.length > 0 && choiceOptionsElement) {
            this.quizzes.forEach((quiz: QuezListType) => {
                const that: Choice = this;
                const choiceOptionElement: HTMLElement | null = document.createElement('section');
                choiceOptionElement.className = 'choice-option';
                choiceOptionElement.setAttribute('data-id', quiz.id.toString());
                choiceOptionElement.onclick = function () {
                    that.chooseQuiz(<HTMLElement>this);
                };

                const choiceOptionTextElement: HTMLElement | null = document.createElement('section');
                choiceOptionTextElement.className = 'choice-option-text';
                choiceOptionTextElement.innerText = quiz.name;

                const choiceOptionArrowElement: HTMLElement | null = document.createElement('section');
                choiceOptionArrowElement.className = 'choice-option-arrow';

                if (this.restResult) {
                    const result: TestResultType | undefined = this.restResult.find(item => item.testId === quiz.id);
                    if (result) {
                        const choiceOptionResultElement: HTMLElement | null = document.createElement('section');
                        choiceOptionResultElement.className = 'choice-option-result';
                        choiceOptionResultElement.innerHTML = `
                        <section>Результат</section>
                        <section>${result.score}/${result.total}</section>
                    `;
                        choiceOptionElement.appendChild(choiceOptionResultElement);
                    }
                }


                const choiceOptionImageElement: HTMLElement | null = document.createElement('img');
                choiceOptionImageElement.setAttribute('src', 'assets/images/arrow.png');
                choiceOptionImageElement.setAttribute('alt', 'Arrow');

                choiceOptionArrowElement.appendChild(choiceOptionImageElement);
                choiceOptionElement.appendChild(choiceOptionTextElement);
                choiceOptionElement.appendChild(choiceOptionArrowElement);

                choiceOptionsElement.appendChild(choiceOptionElement);
            });
        };
    }

    private chooseQuiz(element: HTMLElement): void {
        const dataId: string | null = element.getAttribute('data-id');
        const userInfo: UserInfoType | null = Auth.getUserInfo();

        if (dataId && userInfo) {
            userInfo.testId = dataId;
            Auth.setUserInfo(userInfo);
            location.href = '#/test';
        }
    }
};