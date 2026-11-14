import { useMemo } from 'react';
import DialogStajirovka from './DialogStajirovka.jsx';
import MDataGrid from '../../DataGrid/MDataGrid.jsx';
import { useTableActions } from '../../../websocket/LayoutMessage.jsx';
import { useStajirovka } from '../../../websocket/WebSocketContext.jsx'

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
import { dateColumn } from '../../DataGrid/DataGridUtils/columnFactories.js';
dayjs.locale('ru');

export default function Stajirovka() {
    // вызываем кастомный хук для даления строки из БД
    const { handleDeleteRowBD, handleAddInTable, handleEditRow } = useTableActions();
    const Stajirovka = useStajirovka()

    const filteredStajirovka = useMemo(()=>{
        return [...Stajirovka].sort((a, b) => dayjs(b.data_dob).valueOf() - dayjs(a.data_dob).valueOf())
    },[Stajirovka])

    const columnsStajirovka = useMemo(()=>
        [
            { field: '_sotr', headerName: 'ФИО',  flex:0.7,
                valueGetter: (params) => params?.fio || ''
            }, 
            { field: 'prikaz', headerName: 'Приказ',flex:0.3},
            dateColumn('data_prikaza', 'Дата приказа', 0.3),
            dateColumn('data_n', 'Дата начала', 0.3),
            dateColumn('data_k', 'Дата окончания', 0.3),
            { field: '_otkyda', headerName: 'Откуда',  flex:0.3,
                valueGetter: (params) => params?.name || ''
            }, 
            { field: '_kyda', headerName: 'Куда',  flex:0.3,
                valueGetter: (params) => params?.name || ''
            },
            dateColumn('data_dob', 'Дата доб.', 0.4, 'DD.MM.YYYY HH:mm'), 
            { field: '_who', headerName: 'Кто доб.',  flex:0.3,
              valueGetter: (params) => params?.name || ''
            }, 
            { field: 'descrip', headerName: 'Описание', width: 150, flex:0.3, },
        ],[]
    ) 

    return (
        <div className='animated-element'>
            <MDataGrid 
                columns={columnsStajirovka} 
                tableData={filteredStajirovka}
                collectionName={`Stajirovka`} 
                actionEdit={(id,oldData,collectionName)=>handleEditRow(id,oldData,collectionName,DialogStajirovka)}
                actionDelete={handleDeleteRowBD}
                actionAdd={()=>handleAddInTable(`Stajirovka`,DialogStajirovka)}
            />
        </div>
    )
}