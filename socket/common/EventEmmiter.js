module.exports = class EventEmmiter {
  constructor() {
      this.events = []
  }

  on(eventName, cb) {
      this.events.push({
          event: eventName,
          cb
      })
  }

  emit(eventName, data) {
      const event = this.events.find((event) => event.event === eventName)

      if (event) {
          event.cb(data)
      }
  }
}