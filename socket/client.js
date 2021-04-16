import EventEmmiter from './common/EventEmmiter'

export default class Socket extends EventEmmiter{
    constructor(url) {
        super();

        this.socket = new WebSocket(url);

        this.socket.addEventListener('open', () => {
          this.emit('connection', this.socket);
        });
        
        this.socket.addEventListener('message', ({ data }) => {
            //console.log(data.event);
            //console.log(data);
            data = JSON.parse(data);
            this.emit(data.event, data.payload);
        });
        
        this.socket.addEventListener('close', (e) => {
            this.emit('disconnect', e);//
        });
    };

    send(eventName, data) {
        this.socket.send(JSON.stringify({
            event: eventName,
            payload: data
        }));
    };
};