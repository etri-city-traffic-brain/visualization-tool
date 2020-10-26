
function QueueManager() {
  const queueRegistry = Object.create(null);

  return {
    addQueue(id) {
      if(queueRegistry[id]) {
        return queueRegistry[id]
      }
      queueRegistry[id] = {
        created: new Date().getTime(),
        dataQueue: [],
        commandQueue: [],
      };
      return queueRegistry[id]
    },
    deleteQueue(id) {
      delete queueRegistry[id];
    },
    getQueue(id) {
      return queueRegistry[id];
    },
    getQueueIds() {
      return Object.keys(queueRegistry);
    },
  };
}

module.exports = QueueManager;
