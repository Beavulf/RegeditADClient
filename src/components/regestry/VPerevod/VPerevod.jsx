import { useMemo } from 'react';
import DialogVPerevod from './DialogVPerevod.jsx';
import MDataGrid from '../../DataGrid/MDataGrid.jsx';
import { useTableActions } from '../../../websocket/LayoutMessage.jsx';
import { useVPerevod } from '../../../websocket/WebSocketContext.jsx'

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
import { dateColumn } from '../../DataGrid/DataGridUtils/columnFactories.js';
dayjs.locale('ru');

export default function VPerevod() {
    // вызываем кастомный хук для даления строки из БД
    const { handleDeleteRowBD, handleAddInTable, handleEditRow } = useTableActions();
    const VPerevod = useVPerevod()
    const columnsVPerevod = useMemo(()=>
        [
            { field: '_sotr', headerName: 'ФИО',  flex:0.7,
                valueGetter: (params) => params?.fio || ''
            }, 
            { field: 'prikaz', headerName: 'Приказ',flex:0.3},
            dateColumn('data_prikaza', 'Дата приказа', 0.3),
            dateColumn('data_n', 'Дата С', 0.3),
            dateColumn('data_k', 'Дата ПО', 0.3),
            { field: '_otkyda', headerName: 'Откуда',  flex:0.3,
                valueGetter: (params) => params?.name || ''
            }, 
            { field: '_kyda', headerName: 'Куда',  flex:0.3,
                valueGetter: (params) => params?.name || ''
            },
            { field: 'type', headerName: 'Тип перев.', width: 150, flex:0.3, },
            dateColumn('data_dob', 'Дата доб.', 0.3, 'DD.MM.YYYY HH:mm'), 
            { field: '_who', headerName: 'Кто доб.',  flex:0.3,
              valueGetter: (params) => params?.name || ''
            }, 
            { field: 'descrip', headerName: 'Описание', width: 150, flex:0.3, },
        ],[]
    ) 

    const filteredVPerevod = useMemo(()=>{
        return VPerevod.sort((a, b) => dayjs(b.data_dob).valueOf() - dayjs(a.data_dob).valueOf())
    },[VPerevod])

    return (
        <div className='animated-element'>
            <MDataGrid 
                columns={columnsVPerevod} 
                tableData={filteredVPerevod}
                collectionName={`VPerevod`} 
                actionEdit={(id,oldData,collectionName)=>handleEditRow(id,oldData,collectionName,DialogVPerevod)}
                actionDelete={handleDeleteRowBD}
                actionAdd={()=>handleAddInTable(`VPerevod`,DialogVPerevod)}
            />
        </div>
    )
}