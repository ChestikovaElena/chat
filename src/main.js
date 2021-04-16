import './scss/main.scss';
import View from './js/view';
import { sanitize } from './js/utils';
import { readfiles, previewfile, set, onUpload} from './js/userPhoto';
import Socket from '../socket/client';
import { createNewElement, declOfNum, getFormatTime } from './js/helpers';

const socket = new Socket('ws://localhost:8000');
const msgList = document.querySelector('[data-role="messageList"]');

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
                setImage(currentName);
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

    const hamburgerElem = document.querySelector('#hamburger');
    const formPhoto = document.querySelector('[data-role="change-photo"]');
    hamburgerElem.addEventListener('click', (e) => {
        formPhoto.style.display = "block";
        const currentName = msgList.getAttribute('data-name');
        const photoElem = formPhoto.querySelector('[data-role="user-photo"]');
        
        photoElem.setAttribute('data-name', currentName);
        setImage(currentName);
        
        photoElem.ondragover = function () {
            photoElem.classList.add('hover');
            return false;
        };
        photoElem.ondragend = function () {
            photoElem.classList.remove('hover');
            return false;
        };
        photoElem.ondrop = function (e) {
            photoElem.classList.remove('hover');
            e.preventDefault();
            readfiles(e.dataTransfer.files, photoElem, socket);
        };

        formPhoto.querySelector('[data-role="save-photo"]').addEventListener('click', () => {
            socket.send('image:save', JSON.stringify({name: currentName}));

            const status = formPhoto.querySelector('[data-role="user-status"]');
            const statusVal = status.value.trim();
            if (statusVal) {
                socket.send('user:status', JSON.stringify({name: currentName, status: statusVal}));
            };

            formPhoto.style.display = 'none';
            overlay.style.width="0%";
            overlay.style.opacity="1";
            setImage(currentName);
        })

        formPhoto.querySelector('[data-role="cancel-photo"]').addEventListener('click', () => {
            socket.send('image:cancel', JSON.stringify({name: currentName}));
            formPhoto.style.display = 'none';
            overlay.style.width="0%";
            overlay.style.opacity="1";
            setDefaultImage(currentName);
        })

        const overlay = document.querySelector('[data-role="overlay"]');
        overlay.style.width="100%";
        overlay.style.opacity=".6";
    });

    formPhoto.querySelector('[data-role="form-close"]')
        .addEventListener('click', () => {
            closeForm(formPhoto);
        })

    const loadPhoto = document.querySelector('[data-role="load-photo"]');
    document.addEventListener('click', (e) => {
        e.preventDefault();

        if ((e.target.getAttribute('data-role') === "user-photo") || 
            (e.target.parentNode.getAttribute('data-role') === "user-photo")) {
                loadPhoto.style.display = "block";
                const currentName = msgList.getAttribute('data-name');
                loadPhoto.querySelector('.load__photo--name').textContent = currentName;
                loadPhoto.querySelector('[data-role="user-photo"]').setAttribute('data-name', currentName);
                const photoElem = loadPhoto.querySelector('[data-role="user-photo"]');
                photoElem.setAttribute('data-name', currentName);

                setImage(currentName);
        
                photoElem.ondragover = function () {
                    photoElem.classList.add('hover');
                    return false;
                };
                photoElem.ondragend = function () {
                    photoElem.classList.remove('hover');
                    return false;
                };
                photoElem.ondrop = function (e) {
                    photoElem.classList.remove('hover');
                    e.preventDefault();
                    readfiles(e.dataTransfer.files, photoElem, socket);
                };

                loadPhoto.querySelector('[data-role="save-photo"]').addEventListener('click', () => {
                    socket.send('image:save', JSON.stringify({name: currentName}));
                    loadPhoto.style.display = 'none';
                    overlay.style.width="0%";
                    overlay.style.opacity="1";
                    setImage(currentName);
                })

                loadPhoto.querySelector('[data-role="cancel-photo"]').addEventListener('click', () => {
                    socket.send('image:cancel', JSON.stringify({name: currentName}));
                    loadPhoto.style.display = 'none';
                    overlay.style.width="0%";
                    overlay.style.opacity="1";
                    setDefaultImage(currentName);
                })


                const overlay = document.querySelector('[data-role="overlay"]');
                overlay.style.width="100%";
                overlay.style.opacity=".6";
        };
    });

    loadPhoto.querySelector('[data-role="form-close"]')
    .addEventListener('click', () => {
        closeForm(loadPhoto);
    })

    function closeForm(form) {
        form.style.display = 'none';
        const overlay = document.querySelector('[data-role="overlay"]');
        overlay.style.width="0%";
    }
});

socket.on('user:on', (data) => {
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
    const dataUsers = data.list;
    const currentName = msgList.getAttribute('data-name');

    const photoElem = users.querySelector(`[data-role="user-photo"][data-name=${currentName}]`);
        console.log('есть',photoElem);
        if (photoElem) {
        photoElem.ondragover = function () {
            photoElem.classList.add('hover');
            return false;
        };
        photoElem.ondragend = function () {
            photoElem.classList.remove('hover');
            return false;
        };
        photoElem.ondrop = function (e) {
            photoElem.classList.remove('hover');
            e.preventDefault();
            readfiles(e.dataTransfer.files, photoElem, socket);
        };
    };
    
    const userList = document.querySelector('#users');
    dataUsers.forEach(user => { 
        setImage(user.name);
        const userElem = userList.querySelector(`[data-name="${user.name}"]`);
        const userStatusElem = userElem.querySelector('.user-status');
        userStatusElem.textContent = user.status;
     });
    
    const countOfUsers = document.querySelector('[data-role="countOfUsers"]');
    const value = document.querySelector('[data-role="value"]');
    const count = data.list.length;
    if (count) {
        countOfUsers.textContent = count;
        value.textContent = declOfNum(count, ['участник', 'участника', 'участников']);
    }

    
    // console.log(dataUsers.name);
    // const userElem = userList.querySelector(`[data-name="${dataUsers.name}"]`);
    // console.log(userElem);
    // const userStatusElem = userElem.querySelector('.user-status');
        
    // userStatusElem.textContent = data.status;

    // const photoElem = users.querySelector('[data-role="user-photo"]');
    // console.log('есть',photoElem);
    // if (photoElem) {
    //     photoElem.ondragover = function () {
    //         photoElem.classList.add('hover');
    //         return false;
    //     };
    //     photoElem.ondragend = function () {
    //         photoElem.classList.remove('hover');
    //         return false;
    //     };
    //     photoElem.ondrop = function (e) {
    //         photoElem.classList.remove('hover');
    //         e.preventDefault();
    //         readfiles(e.dataTransfer.files, photoElem, socket);
    //     };
    // };
});

socket.on('user:status', (data) => {
    data = JSON.parse(data);
    const userList = document.querySelector('#users');
    const userElem = userList.querySelector(`[data-name="${data.name}"]`);
    const userStatusElem = userElem.querySelector('.user-status');
        
    userStatusElem.textContent = data.status;
})

socket.on('message:add', (data) => {
    const currentName = msgList.getAttribute('data-name');
    const prevMsg = msgList.lastElementChild;
    const msgTextWrap = prevMsg.querySelector('.user__list');

    if (!(currentName === data.name)) {
        if (data.name === prevMsg.getAttribute('data-name')) {
            msgTextWrap.innerHTML += View.render('simpleMessage', data);
        } else {
            msgList.innerHTML += View.render('complexMessage', data);
            setImage(data.name);
        };
    };
    
    msgList.scrollTop = msgList.scrollHeight;
});

socket.on('image:change', (data) => {
    data = JSON.parse(data);
    setImage(data.name);
});

function setDefaultImage(currentName) {
    const filePath = `../src/img/no-photo.png`;
    const divDuble = document.querySelectorAll(`[data-role="user-photo"][data-name="${currentName}"]`);
    
    divDuble.forEach(div => {
        const imageElem = div.firstElementChild;
        imageElem.setAttribute("src", filePath);
    });
};

function setImage(userName) {
    // let isExistFile = checkFileAsync(userName);
    // console.log('isExistFile', isExistFile);
    
    // const fallBackPath = `../src/img/no-photo.png`;
    // let filePath = (isExistFile) ? `../server/upload/${userName}.png` : fallBackPath;
    let filePath = `../server/upload/${userName}.png`;
    console.log(filePath);

    const divDuble = document.querySelectorAll(`[data-role="user-photo"][data-name="${userName}"]`);
    console.log('divDuble', divDuble);
    divDuble.forEach(div => {
        const imageElem = div.firstElementChild;
        imageElem.setAttribute("src", filePath);
    });
}
