import { useDialogs } from '@toolpad/core/useDialogs';
import { useWebSocketContext } from './WebSocketContext.jsx';

export function useTableActions() {
  const dialogs = useDialogs();
  const { sendJsonMessage } = useWebSocketContext();

  // Удаление строки
  const handleDeleteRowBD = async (id, collectionName, row) => {
    
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
  };

// Добавление одной или нескольких строк
const handleAddInTable = async (collectionName, dialog, ddata=null) => {
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
};


  // Редактирование строки
  const handleEditRow = async (id, oldData, collectionName, dialog) => {
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
      console.error('Error in edit action', e)
    }
    finally {
      handleSetBlockedRow(id, false, collectionName);
    }
  };

  async function handleSetBlockedRow(id,type, collectionName) {
    const message = {
        type: 'updateInCollection',
        data: {
            collection: collectionName,
            filter: {_id: id},
            value: {is_locked:type}
        }
    }
    sendJsonMessage(message);
  }
  
  return {
    handleDeleteRowBD,
    handleAddInTable,
    handleEditRow,
    handleSetBlockedRow,
  };
}
