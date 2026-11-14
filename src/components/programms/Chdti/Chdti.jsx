import { useMemo } from 'react';
import DialogChdti from './DIalogChdti.jsx';
import MDataGrid from '../../DataGrid/MDataGrid.jsx';
import { useTableActions } from '../../../websocket/LayoutMessage.jsx';
import { useChdti } from '../../../websocket/WebSocketContext.jsx'

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
import { dateColumn } from '../../DataGrid/DataGridUtils/columnFactories.js';
dayjs.locale('ru');

export default function Chdti() {
    // вызываем кастомный хук для даления строки из БД
    const { handleDeleteRowBD, handleAddInTable, handleEditRow } = useTableActions();
    const Chdti = useChdti()

    const columnsChdti = useMemo(()=>
        [
            { field: '_sotr', headerName: 'ФИО',  flex:0.7,
                valueGetter: (params) => params?.fio || ''
            }, 
            { field: 'deistvie', headerName: 'Действие',flex:0.5},
            { field: 'obosnovanie', headerName: 'Обоснование',  flex:0.4,},
            { field: 'prava', headerName: 'Права',  flex:0.3,},
            dateColumn('data_dob', 'Дата доб.', 0.3, 'DD.MM.YYYY HH:mm'), 
            { field: '_who', headerName: 'Кто доб.',  flex:0.3,
              valueGetter: (params) => params?.name || ''
            }, 
            { field: 'descrip', headerName: 'Описание', width: 150, flex:0.3, },
        ],[]
    ) 

    const filteredChdti = useMemo(()=>{
        return Chdti.sort((a, b) => dayjs(b.data_dob).valueOf() - dayjs(a.data_dob).valueOf())
    },[Chdti])

    return (
        <div className='animated-element'>
            <MDataGrid 
                columns={columnsChdti} 
                tableData={filteredChdti}
                collectionName={`ChdTI`} 
                actionEdit={(id,oldData,collectionName)=>handleEditRow(id,oldData,collectionName,DialogChdti)}
                actionDelete={handleDeleteRowBD}
                actionAdd={()=>handleAddInTable(`ChdTI`,DialogChdti)}
            />
        </div>
    )
}