import Cookies from "js-cookie"
const socket = new WebSocket(`ws://edu.strada.one/websockets?${Cookies.get('token')}`)
socket.onmessage = function(event) {
    createMessage (true, event.data.user.name, event.data.text, event.data.createdAt )
    console.log(event.data)};

const chat = document.querySelector(".middle");
chat.scrollTop = chat.scrollHeight;
const message = document.querySelector('#enter_message')

/////////////////////////
//Авторизация - модалка
const autorizationButton = document.querySelector("#autorization")
const autorizationModal = document.querySelector("#autorizationModal")
const autorizationModalCloseButton = document.querySelector("#autorizationModal").querySelector("#close")
autorizationButton.addEventListener('click', () => autorizationModal.classList.add('active'))
autorizationModalCloseButton.addEventListener('click', () => autorizationModal.classList.remove('active'))
const email = document.querySelector('#enter_email')
const sendCode = document.querySelector('#email')
sendCode.addEventListener('submit', sendAuth)

/////////////////////////
//Авторизация - функция
async function sendAuth(env){
    env.preventDefault()
    const authUrl = 'https://edu.strada.one/api/user'
    const emailValue = email.value
    let response = await fetch(authUrl, {
        method: 'POST',
        body: JSON.stringify({email: emailValue}),
        headers: {
            'Content-Type': 'application/json',
            Accept : "application/json",
            mode : 'no-cors'
        },
    })
    const data = await response.json();
    return data
}

/////////////////////////
//Подтверждение - модалка
const confirmationButton = document.querySelector("#confirmation")
const confirmationModal = document.querySelector("#confirmationModal")
const confirmationModalCloseButton = document.querySelector("#confirmationModal").querySelector("#close")
confirmationButton.addEventListener('click', () => confirmationModal.classList.add('active'))
confirmationModalCloseButton.addEventListener('click', () => confirmationModal.classList.remove('active'))
const token = document.querySelector('#enter_confirm')
const checkToken = document.querySelector('#email_confirm')
//Подтверждение - сохранение токена в куки
checkToken.addEventListener('submit', () => Cookies.set(`token`, `${token.value}`, { expires: 7 }))

/////////////////////////
//Настройки - модалка
const settingsButton = document.querySelector("#settings")
const settingsModal = document.querySelector("#settingsModal")
const settingsModalCloseButton = document.querySelector("#settingsModal").querySelector("#close")
settingsButton.addEventListener('click', () => settingsModal.classList.add('active'))
settingsModalCloseButton.addEventListener('click', () => settingsModal.classList.remove('active'))
const userName = document.querySelector('#enter_name')
const sendName = document.querySelector('#name')
sendName.addEventListener('submit', changeName)


/////////////////////////
//Настройки - смена имени
async function changeName(env){
    env.preventDefault()
    const authUrl = 'https://edu.strada.one/api/user'
    const namelValue = userName.value
    let response = await fetch(authUrl, {
        method: 'PATCH',
        body: JSON.stringify({name: namelValue}),
        headers: {
            'Content-Type': 'application/json',
            Accept : "application/json",
            mode : 'no-cors',
            Authorization : `Bearer ${Cookies.get('token')}`
        },
    })
    const data = await response.json();
    return data
}

async function checkUser() {
    const checkUrl = 'https://edu.strada.one/api/user/me'
    let response = await fetch(checkUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Accept : "application/json",
            mode : 'no-cors',
            Authorization : `Bearer ${Cookies.get('token')}`
        },
    })
    const data = await response.json();
    return data
}
checkUser().then(data => Cookies.set(`myEmail`, `${data.email}`))

const createMessage = (isOutgingMessage, name, text, time) =>{
    const template = document.querySelector(isOutgingMessage ? '#outgoing_message' : '#incoming_message');
    let newMessage = template.content.cloneNode(true);
    newMessage.querySelector(".name").textContent = name;
    newMessage.querySelector(".message").textContent = text;
    newMessage.querySelector(".time").textContent = new Date(time).toLocaleTimeString();
    chat.prepend(newMessage) 
}

const sendMessage = document.querySelector('.bottom')
sendMessage.addEventListener('submit', send)

function send(env) {
    env.preventDefault()
    const nowTime = new Date()
    let textMessage = message.value
    socket.send(JSON.stringify({text: `${textMessage}`}))
}

async function history(){
    const historykUrl = 'https://edu.strada.one/api/messages/'
    let response = await fetch(historykUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Accept : "application/json",
            mode : 'no-cors',
            Authorization : `Bearer ${Cookies.get('token')}`
        },
    })
    const data = await response.json();
    return data.messages
}
history().then(data=>render(data))

function render(messages){
    for (let message of messages) {
        createMessage(false, message.user.name, message.text, message.createdAt)
    }
}