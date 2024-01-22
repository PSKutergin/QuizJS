import { Form } from './components/form.js';
import { Choice } from './components/choice.js';
import { Test } from './components/test.js';
import { Result } from './components/result.js';
import { Right } from './components/right.js';
import { Auth } from './services/auth.js';

export class Router {
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

    async openRoute() {
        const urlRoute = window.location.hash.split('?')[0];

        if (urlRoute === '#/logout') {
            await Auth.logout();
            window.location.hash = '#/';
            return;
        }

        const newRoute = this.routes.find(item => item.route === urlRoute);

        if (!newRoute) {
            window.location.hash = '#/';
            return;
        };

        this.contentElement.innerHTML = await fetch(newRoute.template).then(res => res.text());
        this.styleElement.setAttribute('href', newRoute.styles);
        this.titleElement.innerText = newRoute.title;

        const userInfo = Auth.getUserInfo();
        const accessToken = localStorage.getItem(Auth.accessTokenKey);

        if (userInfo && accessToken) {
            this.profileElement.style.display = 'flex';
            this.profileUserElement.innerText = userInfo.fullName;
        } else {
            this.profileElement.style.display = 'none';
        }

        newRoute.load();
    }
}