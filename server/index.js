const http = require('http');
const Ws = require('../socket/server');

const server = http.createServer((req, res) => {
    console.log(req.method, req.url);

    res.end(JSON.stringify({status: 'ok'}));
});


const ws = new Ws(server);
let users = [];
let user;

ws.on('connection', (ws) => {
    user = {};
    user = {connection: ws};
    
    console.log("New connection");
});

ws.on('user:on', (data) => {
    ws.broadcast('user:on', data);
    
    user.name = data.message;
    users.push(user);
    ws.broadcast('usersList', JSON.stringify({list: users.map((user) => ({'name': user.name}))}));
});

ws.on('message:add', (data) => {
    ws.broadcast('message:add', data);
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

server.listen(8000, () => {
    console.log('server is run');
});