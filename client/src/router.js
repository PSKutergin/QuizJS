import { Form } from './components/form.js';
import { Choice } from './components/choice.js';
import { Test } from './components/test.js';
import { Result } from './components/result.js';
import { Right } from './components/right.js';

export class Router {
    constructor() {
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
        const newRoute = this.routes.find(item => item.route === window.location.hash.split('?')[0]);

        if (!newRoute) {
            window.location.hash = '#/';
            return;
        };

        document.getElementById('content').innerHTML = await fetch(newRoute.template).then(res => res.text());
        document.getElementById('styles').setAttribute('href', newRoute.styles);
        document.getElementById('page-title').innerText = newRoute.title;
        newRoute.load();
    }
}