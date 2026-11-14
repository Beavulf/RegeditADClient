import { useMemo } from 'react';
import DialogNaznachenie from './DialogNaznachenie.jsx';
import MDataGrid from '../../DataGrid/MDataGrid.jsx';
import { useTableActions } from '../../../websocket/LayoutMessage.jsx';
import { useNaznachenie } from '../../../websocket/WebSocketContext.jsx'

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
import { dateColumn } from '../../DataGrid/DataGridUtils/columnFactories.js';
dayjs.locale('ru');

export default function Naznachenie() {
    // вызываем кастомный хук для даления строки из БД
    const { handleDeleteRowBD, handleAddInTable, handleEditRow } = useTableActions();
    const Naznachenie = useNaznachenie()
    const columnsNaznachenie = useMemo(()=>
        [
            { field: '_sotr', headerName: 'ФИО',  flex:0.7,
                valueGetter: (params) => params?.fio || ''
            }, 
            { field: 'prikaz', headerName: 'Приказ',flex:0.3},
            dateColumn('data_prikaza', 'Дата приказа', 0.3),
            dateColumn('data_nazn', 'Дата назнач.', 0.3),
            { field: '_pred_znach', headerName: 'Пред.',  flex:0.3,
                valueGetter: (params) => params?.name || ''
            }, 
            { field: '_new_znach', headerName: 'Новое',  flex:0.3,
                valueGetter: (params) => params?.name || ''
            },
            dateColumn('data_dob', 'Дата доб.', 0.3, 'DD.MM.YYYY HH:mm'), 
            { field: '_who', headerName: 'Кто доб.',  flex:0.3,
              valueGetter: (params) => params?.name || ''
            }, 
            { field: 'descrip', headerName: 'Описание', width: 150, flex:0.3, },
        ],[]
    ) 

    const filteredNaznachenie = useMemo(()=>{
        return [...Naznachenie].sort((a, b) => dayjs(b.data_dob).valueOf() - dayjs(a.data_dob).valueOf())
    },[Naznachenie])

    return (
        <div className='animated-element'>
            <MDataGrid 
                columns={columnsNaznachenie} 
                tableData={filteredNaznachenie}
                collectionName={`Naznachenie`} 
                actionEdit={(id,oldData,collectionName)=>handleEditRow(id,oldData,collectionName,DialogNaznachenie)}
                actionDelete={handleDeleteRowBD}
                actionAdd={()=>handleAddInTable(`Naznachenie`,DialogNaznachenie)}
            />
        </div>
    )
}