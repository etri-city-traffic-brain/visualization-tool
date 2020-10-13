
function QueueManager() {
  const queueRegistry = Object.create(null);

  return {
    addQueue(id) {
      queueRegistry[id] = {
        dataQueue: [],
        commandQueue: [],
      };
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
