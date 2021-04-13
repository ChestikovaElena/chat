import './scss/main.scss';
import View from './js/view';
import { sanitize } from './js/utils';
import UserPhoto from './js/userPhoto';
import Socket from '../socket/client';
import { createNewElement, declOfNum, getFormatTime } from './js/helpers';

const socket = new Socket('ws://localhost:8000');
const msgList = document.querySelector('[data-role="messageList"]');
// const messages = document.querySelector('[data-role=messageList]');

socket.on('connection', () => {
    document.querySelector('[data-send="user"]')
        .addEventListener('click', (e) => {
            e.preventDefault();
            
            const loginForm = document.querySelector('[data-role="login-form"]'),
                overlay = document.querySelector('[data-role="overlay"]'),
                value = loginForm.querySelector('#login').value.trim();
            if (value) {
                loginForm.classList.add('login--hidden');
                msgList.setAttribute('data-name',value);
                overlay.style.width = '0%';

                socket.send('user:on', { message: value });
            }
            loginForm.querySelector('#login').value = '';
        })
    document.querySelector('[data-send="message"]')
        .addEventListener('click', (e) => {
            e.preventDefault();
            
            const value = document.querySelector('#inputMessage').value.trim();
            const currentName = msgList.getAttribute('data-name');
            const msg = {message: sanitize(value), time: getFormatTime(new Date()), name: currentName};
            let prevMsg = msgList.lastElementChild;
            let msgTextWrap = prevMsg.querySelector('.user__list');

            if (currentName === prevMsg.getAttribute('data-name')) {
                console.log('simpleMessage');
                msgTextWrap.innerHTML += View.render('simpleMessageRight', msg);
            } else {
                console.log('complexMessage');
                msgList.innerHTML += View.render('complexMessageRight', msg);
            };

            // msgList.lastElementChild.classList.add('right-column__item--right');
            // prevMsg = msgList.lastElementChild;
            // msgTextWrap = prevMsg.querySelector('.user__list');
            
            // const userPhotoElem = msgList.querySelector('[data-role="user-photo"]');
            // console.log(userPhotoElem);
            // if (!userPhotoElem.classList.contains('item__photo--right')) {
            //     userPhotoElem.classList.add('item__photo--right');
            // };

            // const msgElem = msgTextWrap.lastElementChild;
            // if (!msgElem.classList.contains('message--right')) {
            //     msgElem.classList.add('message--right');
            // };

            // const msgArrow = msgElem.querySelector('.message__arrow');
            // if ((msgArrow) && (!msgArrow.classList.contains('message__arrow--right'))) {
            //     msgArrow.classList.add('message__arrow--right');
            //     msgArrow.classList.remove('message__arrow');
            // };

            socket.send('message:add', msg);
            document.querySelector('#inputMessage').value = '';
            msgList.scrollTop = msgList.scrollHeight;
        });
    document.querySelector('#hamburger')
        .addEventListener('click', (e) => {
            console.log('ткнули ');
        });
    document.addEventListener('click', (e) => {
        e.preventDefault();

        if ((e.target.getAttribute('data-role') === "user-photo") || 
            (e.target.parentNode.getAttribute('data-role') === "user-photo")) {
                const formPhoto = document.querySelector('[data-role="form-photo"]');
                formPhoto.style.display = "block";
                const currentName = msgList.getAttribute('data-name');
                formPhoto.querySelector('.form__photo--name').textContent = currentName;

                const overlay = document.querySelector('[data-role="overlay"]');
                overlay.style.width="100%";
                overlay.style.opacity=".6";
        };
    });
    // document.querySelector('[data-role="user__photo"]')
    //     .addEventListener('click', (e) => {
    //     e.preventDefault();
    //     console.log('ok');
        
    // });
});

socket.on('user:on', (data) => {
    console.log(data);
    const newMsg = createNewElement(data.message, 'on');
    msgList.appendChild(newMsg);
});

socket.on('user:off', (data) => {
    data = JSON.parse(data);
    const newMsg = createNewElement(data.message, 'off');
    msgList.appendChild(newMsg);
})

socket.on('usersList', (data) => {
    data = JSON.parse(data);
    const users = document.querySelector('#users');
    users.innerHTML = View.render('users', { list: data.list });

    const countOfUsers = document.querySelector('[data-role="countOfUsers"]');
    const value = document.querySelector('[data-role="value"]');
    const count = data.list.length;
    if (count) {
        countOfUsers.textContent = count;
        value.textContent = declOfNum(count, ['участник', 'участника', 'участников']);
    }
});

socket.on('message:add', (data) => {
    const currentName = msgList.getAttribute('data-name');
    const prevMsg = msgList.lastElementChild;
    const msgTextWrap = prevMsg.querySelector('.user__list');

    if (!(currentName === data.name)) {
        if (data.name === prevMsg.getAttribute('data-name')) {
            console.log(currentName);
            console.log(prevMsg.getAttribute('data-name'));

            msgTextWrap.innerHTML += View.render('simpleMessage', data);
        } else {
            console.log('complexMessage');
            msgList.innerHTML += View.render('complexMessage', data);
        };
    };

    msgList.scrollTop = msgList.scrollHeight;
});