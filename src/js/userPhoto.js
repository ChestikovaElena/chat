function readfiles(files, elem, socket) {
  let formData = (!!window.FormData) ? new FormData() : null;
  for (var i = 0; i < files.length; i++) {
    if (!!window.FormData) formData.append('file', files[i]);
    previewfile(files[i], elem, socket);
  }
}

function previewfile(file, elem, socket) {
  const acceptedTypes = {
    'image/png': true,
    'image/jpeg': true,
    'image/gif': true
  };

  console.log('previewfile');
  if ((typeof FileReader != 'undefined') === true && acceptedTypes[file.type] === true) {
    let reader = new FileReader();
    reader.onload = function (event) {
      const imageElem = elem.firstElementChild;
      imageElem.src = event.target.result;
      const userName = elem.getAttribute('data-name');
      onUpload(event.target.result, userName, socket);
      set(event.target.result, userName);
    };

    reader.readAsDataURL(file);
  }
}

function onUpload(data, userName, socket) {
  console.log('upload');
  socket.send('image:сhange', JSON.stringify({data: data, name: userName}));
}

function set(data, userName) {
  const divDuble = document.querySelectorAll(`[data-role=user-photo][data-name=${userName}]`);
  divDuble.forEach(div => {
    const imageElem = div.firstElementChild;
    imageElem.src = data;
  });
}

export { readfiles, previewfile, onUpload };