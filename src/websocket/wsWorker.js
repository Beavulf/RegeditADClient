// Храним актуальные данные для всех коллекций в Map для оптимизации доступа
const collectionsMap = new Map();

// Обработчики для разных типов сообщений
const handlers = {
  getCollectionMongoose: ({ collection, data }) => {
    collectionsMap.set(collection, data);
    return { type: 'DATA_LOADED', data: { [collection]: data } };
  },

  clients: (message) => {
    collectionsMap.set('Clients', message.clients);
    return { type: 'DATA_LOADED', data: { Clients: message.clients } };
  },

  insert: ({ collection, full }) => {
    const currentData = collectionsMap.get(collection) || [];
    collectionsMap.set(collection, [full, ...currentData]);
    return { type: 'DATA_UPDATED', data: { [collection]: collectionsMap.get(collection) } };
  },

  update: ({ collection, id, full }) => {
    const currentData = collectionsMap.get(collection) || [];
    const dataMap = new Map(currentData.map(item => [item._id, item]));

    if (Array.isArray(full)) {
      full.forEach(item => {
        if (dataMap.has(item._id)) {
          dataMap.set(item._id, { ...dataMap.get(item._id), ...item });
        }
      });
    } else if (dataMap.has(id)) {
      dataMap.set(id, { ...dataMap.get(id), ...full });
    }

    const newData = Array.from(dataMap.values());
    collectionsMap.set(collection, newData);

    if (['Otdel', 'Doljnost'].includes(collection)) {
      self.postMessage({ type: 'LOAD_SOTRUDNIK' });
    }

    return { type: 'DATA_UPDATED', data: { [collection]: newData } };
  },

  delete: ({ collection, id }) => {
    const currentData = collectionsMap.get(collection) || [];
    const newData = currentData.filter(item => item._id !== id);
    collectionsMap.set(collection, newData);
    return { type: 'DATA_UPDATED', data: { [collection]: newData } };
  }
};

self.addEventListener('message', ({ data }) => {
  if (data.type === 'PROCESS_MESSAGE') {
    const { message } = data;
    
    // Определяем тип обработчика
    let handler;
    if (message.type === 'getCollectionMongoose') {
      handler = handlers.getCollectionMongoose;
    } else if (message.clients) {
      handler = handlers.clients;
    } else if (['insert', 'update', 'delete'].includes(message.type)) {
      handler = handlers[message.type];
    }

    // Выполняем обработку если есть подходящий обработчик
    if (handler) {
      const result = handler(message);
      if (result) {
        self.postMessage(result);
      }
    }
  }
});
