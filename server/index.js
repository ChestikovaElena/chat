const http = require('http');
const Ws = require('../socket/server');
const fs = require('fs');
const path = require('path');
let users;
let user;

const server = http.createServer(async (req, res) => {

    res.end(JSON.stringify({status: 'ok'}));
});


const ws = new Ws(server);

ws.on('connection', (ws) => {
    user = {};
    user = {connection: ws};
    
    console.log("New connection");
});

ws.on('user:on', (data) => {
    ws.broadcast('user:on', data);
    
    let filePath = path.resolve(__dirname, '../server/upload', `${data.message}.png`);
    filePath = filePath.replace(/\.\.\/|\//, '');
    let isExistFile = false;
    
    try{
        if (fs.existsSync(filePath)) {
            isExistFile = true;
        } 
    } catch(err) {
        console.error(err);
    };

    if (!isExistFile) {
        fs.open(filePath, 'w', (err) => {
            if (err) throw err;
            console.log('файл создан');
        });
        fs.writeFileSync(filePath, '', 'base64');
    };

    user.name = data.message;
    users.push(user);
    ws.broadcast('usersList', JSON.stringify({list: users.map((user) => ({'name': user.name}))}));
});

ws.on('message:add', (data) => {
    ws.broadcast('message:add', data);
});

ws.on('user:status', (data) =>{
    ws.broadcast('user:status', data);
});

ws.on('image:сhange', (data) => {
    data = JSON.parse(data);
    body = data.data;
    const name = data.name;
    const [, content] = body.match(/data:image\/.+?;base64,(.+)/) || [];
    let filePath = path.resolve(__dirname, '../server/upload', `${name}.png`);
    filePath = filePath.replace(/\.\.\/|\//, '');
    
    if (data.name && content) {
        fs.open(filePath, 'w', (err) => {
            if (err) throw err;
            console.log('файл создан');
        });

        fs.writeFileSync(filePath, content, 'base64');
        ws.broadcast('image:change', JSON.stringify({name: name, filePath: filePath}));
    } else {
        return res.end('fail');
    }

});

ws.on('image:save', () => {
    console.log('сохраняем и не трогаем');
});

ws.on('image:cancel', (data) => {
    data = JSON.parse(data);
    let filePath = path.resolve(__dirname, '../server/upload', `${data.name}.png`);
    filePath = filePath.replace(/\.\.\/|\//, '');
    // const seconds = new Date().getTime();
    // let newPath = path.resolve(__dirname, '../server/basket', `${data.name}_${seconds}.png`);
    // newPath = newPath.replace(/\.\.\/|\//, '');
    // fs.renameSync(filePath, newPath);
    // console.log('перенесли файл');
    fs.writeFileSync(filePath,'',{encoding:'base64',flag:'w'});
});

ws.on('disconnect', (e) => {
    console.log('disconnect');
    const nameUserOff = users.filter(user => user.connection === e)
                        .map((user) => (user.name))[0];
    ws.broadcast('user:off', JSON.stringify({'message': nameUserOff}));

    const ind = users.findIndex((element) => {
        return element.connection === e;
    });
    if (ind !== -1) { 
        users.splice(ind, 1);
    }
    ws.broadcast('usersList', JSON.stringify({list: users.map((user) => ({'name': user.name}))}));
});

ws.on('image:check', (data) => {
    data = JSON.parse(data);
    console.log(data);
    let filePath = path.resolve(__dirname, '../server/upload', `${data.name}.png`);
    filePath = filePath.replace(/\.\.\/|\//, '');
    let isExistFile = false;
    if (fs.existsSync(filePath)) {
        isExistFile = true;
    };
    console.log(isExistFile);
    ws.broadcast('image:check', JSON.stringify({isExistFile: isExistFile}));
})

server.listen(8000, () => {
    console.log('server is run');
    users = [];
});
