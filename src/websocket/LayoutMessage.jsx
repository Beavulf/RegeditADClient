import { useDialogs } from '@toolpad/core/useDialogs';
import { useWebSocketContext } from './WebSocketContext.jsx';
import { useCallback } from 'react';

export function useTableActions() {
  const dialogs = useDialogs();
  const { sendJsonMessage } = useWebSocketContext();

  // установка блокировки строки (блокировка или разблокировка)
  const handleSetBlockedRow = useCallback((id,locked, collectionName) => {
    const message = {
        type: 'updateInCollection',
        data: {
            collection: collectionName,
            filter: {_id: id},
            value: {is_locked:locked}
        }
    }
    sendJsonMessage(message);
  },[sendJsonMessage])

  // Удаление строки
  const handleDeleteRowBD = useCallback (async (id, collectionName) => {
    if (collectionName === 'Pdoka') {
      const message = {
        type: 'deleteFromCollection',
        data: {
          collection: collectionName,
          filter: { _id: id },
        }
      };
      sendJsonMessage(message);
      return;
    }

    const confirmed = await dialogs.confirm(`Удалить выбранную строку ?`, {
      okText: 'Да',
      cancelText: 'Нет',
    });

    const message = {
      type: confirmed ? 'deleteFromCollection' : 'updateInCollection',
      data: {
        collection: collectionName,
        filter: { _id: id },
        ...(confirmed ? {} : { value: { is_locked: false } }),
      },
    };

    sendJsonMessage(message);
  },[sendJsonMessage, dialogs]);

// Добавление одной или нескольких строк
const handleAddInTable = useCallback(async (collectionName, dialog, ddata=null) => {
  let newData;
  if (ddata){
    newData = await dialogs.open(dialog, {addcontext:ddata});
  } else {
    newData = await dialogs.open(dialog);
  }
  if (newData) {
    const formattedData = Array.isArray(newData) 
      ? newData // Если массив, используем его напрямую
      : [newData]; // Если объект, оборачиваем его в массив
    
    const message = {
      type: 'insertInToCollection',
      data: {
        collection: collectionName,
        body: formattedData.map((item) => ({ ...item, is_locked: false })), // Добавляем is_locked ко всем элементам
      },
    };
    sendJsonMessage(message);
    return true
  }
  else return false
},[sendJsonMessage, dialogs]);


  // Редактирование строки
  const handleEditRow = useCallback(async (id, oldData, collectionName, dialog) => {
    handleSetBlockedRow(id, true, collectionName) 
    const newData = await dialogs.open(dialog, oldData);
    try {
      if (collectionName === `Pdoka`) {
        if (newData) {
          const message = {
            type: 'updateInCollection',
            data: {
                collection: collectionName,
                value: newData,
            },
        };
          sendJsonMessage(message);  
        }    
      } else if (newData) {
        const message = {
          type: 'updateInCollection',
          data: {
            collection: collectionName,
            filter: { _id: id },
            value: { ...newData, is_locked: false },
          },
        };
        sendJsonMessage(message);
      } 
    }
    catch(e){
      console.error('Ошибка при редактировании строки: ', e)
      handleSetBlockedRow(id, false, collectionName);
    }
    finally {
      handleSetBlockedRow(id, false, collectionName);
    }
  },[sendJsonMessage, handleSetBlockedRow, dialogs]);

  
  
  return {
    handleSetBlockedRow,
    handleDeleteRowBD,
    handleAddInTable,
    handleEditRow,
  };
}
