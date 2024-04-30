import { Form } from './components/form';
import { Choice } from './components/choice';
import { Test } from './components/test';
import { Result } from './components/result';
import { Right } from './components/right';
import { Auth } from './services/auth';
import { RouteType } from './types/route.type';
import { UserInfoType } from './types/user-info.type';

export class Router {
    readonly contentElement: HTMLElement | null;
    readonly styleElement: HTMLElement | null;
    readonly titleElement: HTMLElement | null;
    readonly profileElement: HTMLElement | null;
    readonly profileUserElement: HTMLElement | null;

    private routes: RouteType[];

    constructor() {
        this.contentElement = document.getElementById('content');
        this.styleElement = document.getElementById('styles');
        this.titleElement = document.getElementById('page-title');
        this.profileElement = document.getElementById('profile');
        this.profileUserElement = document.getElementById('profile-user');

        this.routes = [
            {
                route: '#/',
                title: 'Главная',
                template: 'templates/index.html',
                styles: 'assets/styles/index.css',
                load: () => { }
            },
            {
                route: '#/signup',
                title: 'Регистрация',
                template: 'templates/signup.html',
                styles: 'assets/styles/form.css',
                load: () => {
                    new Form('signup');
                }
            },
            {
                route: '#/login',
                title: 'Вход в систему',
                template: 'templates/login.html',
                styles: 'assets/styles/form.css',
                load: () => {
                    new Form('login');
                }
            },
            {
                route: '#/choice',
                title: 'Выбор теста',
                template: 'templates/choice.html',
                styles: 'assets/styles/choice.css',
                load: () => {
                    new Choice();
                }
            },
            {
                route: '#/test',
                title: 'Прохождение теста',
                template: 'templates/test.html',
                styles: 'assets/styles/test.css',
                load: () => {
                    new Test();
                }
            },
            {
                route: '#/result',
                title: 'Результаты',
                template: 'templates/result.html',
                styles: 'assets/styles/result.css',
                load: () => {
                    new Result();
                }
            },
            {
                route: '#/right',
                title: 'Правильные ответы',
                template: 'templates/right.html',
                styles: 'assets/styles/right.css',
                load: () => {
                    new Right();
                }
            },
        ]
    }

    public async openRoute(): Promise<void> {
        const urlRoute: string = window.location.hash.split('?')[0];

        if (urlRoute === '#/logout') {
            const result: boolean = await Auth.logout();
            if (result) {
                window.location.hash = '#/';
                return;
            }
        }

        const newRoute: RouteType | undefined = this.routes.find(item => item.route === urlRoute);

        if (!newRoute) {
            window.location.hash = '#/';
            return;
        };

        if (!this.contentElement || !this.styleElement || !this.titleElement || !this.profileElement || !this.profileUserElement) {
            if (urlRoute === '#/') {
                return
            } else {
                window.location.hash = '#/';
                return
            }
        }

        this.contentElement.innerHTML = await fetch(newRoute.template).then(res => res.text());
        this.styleElement.setAttribute('href', newRoute.styles);
        this.titleElement.innerText = newRoute.title;

        const userInfo: UserInfoType | null = Auth.getUserInfo();
        const accessToken: string | null = localStorage.getItem(Auth.accessTokenKey);

        if (userInfo && accessToken) {
            this.profileElement.style.display = 'flex';
            this.profileUserElement.innerText = userInfo.fullName;
        } else {
            this.profileElement.style.display = 'none';
        }

        newRoute.load();
    }
}