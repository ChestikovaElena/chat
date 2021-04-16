function createNewElement(name, type) {
  const newMsg = document.createElement('li');
  newMsg.classList.add('message--service');
  newMsg.classList.add('message');
  newMsg.textContent = type == 'on' ? `${name} вошёл в чат` : `${name} вышел из чата`;
  return newMsg;
}

function declOfNum(number, words) {  
  let n = Math.abs(number) % 100;
  let n1 = n % 10;
  if (n > 10 && n < 20) { return words[2]; }
  if (n1 > 1 && n1 < 5) { return words[1]; }
  if (n1 == 1) { return words[0]; }
  return words[2];
}

function getFormatTime(date) {
  return `${date.getHours()}:${date.getMinutes()}`;
}

// function onUpload(data) {
//   this.ui.userPhoto.set(data);

//   fetch('/chat/upload-photo', {
//     method: 'post',
//     body: JSON.stringify({
//       name: this.ui.userName.get(),
//       image: data,
//     }),
//   });
// }

export { createNewElement, declOfNum, getFormatTime }