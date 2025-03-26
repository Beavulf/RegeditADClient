// Храним актуальные данные для всех коллекций отдельно в одном объекте
let updatedData = {};

self.addEventListener('message', ({ data }) => {
  if (data.type === 'PROCESS_MESSAGE') {
    const { message } = data;

    // Обработка запроса на загрузку данных для конкретной коллекции
    if (message.type === 'getCollectionMongoose') {
      const { collection, data: receivedData } = message;
      // Обновляем данные только для этой коллекции
      updatedData = { ...updatedData, [collection]: receivedData };
      // Отправляем обновление только для данной коллекции
      self.postMessage({ type: 'DATA_LOADED', data: { [collection]: receivedData } });
    }

    // Если пришли данные о клиентах
    if (message.clients) {
      updatedData = { ...updatedData, Clients: message.clients };      
      self.postMessage({ type: 'DATA_LOADED', data: { Clients: message.clients } });
    }

    // Обработка операций изменения данных (insert, update, delete)
    if (['insert', 'update', 'delete'].includes(message.type)) {
      const { collection, id, full } = message;
      if (!updatedData[collection]) return;

      // Преобразуем массив коллекции в Map для удобства обновления
      let collectionMap = new Map(updatedData[collection]?.map(item => [item._id, item]) || []);

      switch (message.type) {
        case 'insert':
          updatedData[collection] = [full, ...updatedData[collection] || []];
          collectionMap = new Map(updatedData[collection]?.map(item => [item._id, item]));
          break;
        case 'update':
          if (Array.isArray(full)) {
            full.forEach(updatedItem => {
              if (collectionMap.has(updatedItem._id)) {
                collectionMap.set(
                  updatedItem._id,
                  { ...collectionMap.get(updatedItem._id), ...updatedItem }
                );
              }
            });
          } else {
            if (collectionMap.has(id)) {
              collectionMap.set(id, { ...collectionMap.get(id), ...full });
            }
          }
          // Если изменены данные для коллекций "Otdel" или "Doljnost", запрашиваем обновление "Sotrudnik"
          if (['Otdel', 'Doljnost'].includes(collection)) {
            self.postMessage({ type: 'LOAD_SOTRUDNIK' });
          }
          break;
        case 'delete':
          collectionMap.delete(id);
          break;
      }
      // Преобразуем Map обратно в массив
      const newCollectionData = Array.from(collectionMap.values());
      updatedData[collection] = newCollectionData;
      // Отправляем обновление для конкретной коллекции
      self.postMessage({ type: 'DATA_UPDATED', data: { [collection]: newCollectionData } });
    }
  }
});
