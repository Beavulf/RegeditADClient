import { useMemo } from 'react';
import DialogZapros from './DialogZapros.jsx';
import MDataGrid from '../../DataGrid/MDataGrid.jsx';
import { useTableActions } from '../../../websocket/LayoutMessage.jsx';
import { useZapros } from '../../../websocket/WebSocketContext.jsx'

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

export default function Zapros() {
    // вызываем кастомный хук для даления строки из БД
    const { handleDeleteRowBD, handleAddInTable, handleEditRow } = useTableActions();
    const Zapros = useZapros()
    const columnsZapros = useMemo(()=>
        [
            { field: '_sotr', headerName: 'ФИО',  flex:0.7,
                valueGetter: (params) => params?.fio || ''
            }, 
            { field: 'deistvie', headerName: 'Действие',flex:0.5},
            { field: 'obosnovanie', headerName: 'Обоснование',  flex:0.4,},
            { field: 'prava', headerName: 'Права',  flex:0.3,},
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
                columns={columnsZapros} 
                tableData={Zapros.sort((a, b) => dayjs(b.data_dob).valueOf() - dayjs(a.data_dob).valueOf())}
                collectionName={`Zapros`} 
                actionEdit={(id,oldData,collectionName)=>handleEditRow(id,oldData,collectionName,DialogZapros)}
                actionDelete={handleDeleteRowBD}
                actionAdd={()=>handleAddInTable(`Zapros`,DialogZapros)}
            />
        </div>
    )
}