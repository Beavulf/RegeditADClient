import { useMemo } from 'react';
import DialogRevizor from './DialogRevizor.jsx';
import MDataGrid from '../../DataGrid/MDataGrid.jsx';
import { useTableActions } from '../../../websocket/LayoutMessage.jsx';
import { useRevizor } from '../../../websocket/WebSocketContext.jsx'

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

export default function Revizor() {
    // вызываем кастомный хук для даления строки из БД
    const { handleDeleteRowBD, handleAddInTable, handleEditRow } = useTableActions();
    const Revizor = useRevizor()
    const columnsRevizor = useMemo(()=>
        [
            { field: '_sotr', headerName: 'ФИО',  flex:0.7,
                valueGetter: (params) => params?.fio || ''
            }, 
            { field: 'deistvie', headerName: 'Действие',flex:0.5},
            { field: 'obosnovanie', headerName: 'Обоснование',  flex:0.4,},
            { field: 'data_dob', headerName: 'Дата доб.',flex:0.3,
                type: 'date',
                valueGetter: (params) => {
                    const date = dayjs(params);
                    return date.isValid() ? date.toDate() : null;
                  },
                  renderCell: (params) => {
                    if (params.value) {
                      return dayjs(params.value).format('DD.MM.YYYY HH:mm');
                    }
                    return null;
                  },
            }, 
            { field: '_who', headerName: 'Кто доб.',  flex:0.3,
              valueGetter: (params) => params?.name || ''
            }, 
            { field: 'descrip', headerName: 'Описание', width: 150, flex:0.3, },
        ],[]
    ) 

    return (
        <div className='animated-element'>
            <MDataGrid 
                columns={columnsRevizor} 
                tableData={Revizor.sort((a, b) => dayjs(b.data_dob).valueOf() - dayjs(a.data_dob).valueOf())}
                collectionName={`Revizor`} 
                actionEdit={(id,oldData,collectionName)=>handleEditRow(id,oldData,collectionName,DialogRevizor)}
                actionDelete={handleDeleteRowBD}
                actionAdd={()=>handleAddInTable(`Revizor`,DialogRevizor)}
            />
        </div>
    )
}