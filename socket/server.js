const WebSocket = require('ws');
const EventEmmiter = require('../socket/common/EventEmmiter')

module.exports = class Ws extends EventEmmiter {
    constructor(server) {
        super();

        this.wss = new WebSocket.Server({ server });

        this.wss.on('connection', (ws) => {
            this.send = this.send.bind(ws);

            this.emit('connection', ws);

            ws.on('message', (message) => {
                message = JSON.parse(message);
                
                this.emit(message.event, message.payload);
            });

            ws.on('close', () => {
                this.emit('disconnect', ws);
            });
        });
    };

    send(eventName, data) {
        this.send(JSON.stringify({
            event: eventName,
            payload: data
        }));
    };

    broadcast(eventName, data) {
        this.wss.clients.forEach((ws) => {
            ws.send(JSON.stringify({
                event: eventName,
                payload: data
            }));
        });
    };
};