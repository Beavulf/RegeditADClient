import { useMemo } from 'react';
import DialogPriem from './DialogPriem.jsx';
import MDataGrid from '../../DataGrid/MDataGrid.jsx';
import { useTableActions } from '../../../websocket/LayoutMessage.jsx';
import { usePriem } from '../../../websocket/WebSocketContext.jsx'

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
import { dateColumn } from '../../DataGrid/DataGridUtils/columnFactories.js';
dayjs.locale('ru');

export default function Priem() {
    // вызываем кастомный хук для даления строки из БД
    const { handleDeleteRowBD, handleAddInTable, handleEditRow } = useTableActions();
    const Priem = usePriem()
    const columnsPriem = useMemo(()=>
        [
            { field: '_sotr', headerName: 'ФИО',  flex:0.7,
                valueGetter: (params) => params?.fio || ''
            }, 
            { field: 'prikaz', headerName: 'Приказ',flex:0.3},
            dateColumn('data_priema', 'Дата приема', 0.3),
            dateColumn('data_prikaza', 'Дата приказа', 0.3),
            dateColumn('data_dob', 'Дата доб.', 0.3, 'DD.MM.YYYY HH:mm'), 
            { field: '_who', headerName: 'Кто доб.',  flex:0.3,
              valueGetter: (params) => params?.name || ''
            }, 
            { field: 'descrip', headerName: 'Описание', width: 150, flex:0.3, },
        ],[]
    ) 

    const filteredPriem = useMemo(()=>{
        return [...Priem].sort((a, b) => dayjs(b.data_dob).valueOf() - dayjs(a.data_dob).valueOf())
    },[Priem])

    return (
        <div className='animated-element'>
            <MDataGrid 
                columns={columnsPriem} 
                tableData={filteredPriem}
                collectionName={`Priem`} 
                actionEdit={(id,oldData,collectionName)=>handleEditRow(id,oldData,collectionName,DialogPriem)}
                actionDelete={handleDeleteRowBD}
                actionAdd={()=>handleAddInTable(`Priem`,DialogPriem)}
            />
        </div>
    )
}