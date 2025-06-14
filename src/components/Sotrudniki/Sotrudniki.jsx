import React, { useMemo, useCallback } from 'react';
import DialogAddSotrudnik from './DialogSotrudnik.jsx';
import MDataGrid from '../DataGrid/MDataGrid.jsx';
import { useTableActions } from '../../websocket/LayoutMessage.jsx';
import { useSotrudnik  } from '../../websocket/WebSocketContext.jsx'
import { Typography } from '@mui/material'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

const Sotrudniki = React.memo(function Sotrudniki() {
    // вызываем кастомный хук для даления строки из БД
    const { handleDeleteRowBD, handleAddInTable, handleEditRow } = useTableActions();
    const Sotrudnik = useSotrudnik()
    const columnsSotrudniki = useMemo(()=>
        [
            { field: 'lnp', headerName: 'ЛНП',flex:0.15},
            { field: 'fio', headerName: 'ФИО',flex:0.7},
            { field: '_doljnost', headerName: 'Должность',  flex:0.5,
                valueGetter: (params) => params?.name || ''
            },  
            { field: '_otdel', headerName: 'Отдел', flex:0.3,
                valueFormatter:(params) => params?.name || ''
            },
            { field: 'phone', headerName: 'Телефон', flex:0.2,},
            { field: 'login', headerName: 'DNS', width: 150, flex:0.3, },
            { field: 'descrip', headerName: 'Описание', width: 150, flex:0.3, },
        ],[]
    ) 

    const memoizedHandleEditRow = useCallback((id, oldData, collectionName) => {
        handleEditRow(id, oldData, collectionName, DialogAddSotrudnik);
    }, [handleEditRow]);

    return (
        <div className='animated-element'>
            <MDataGrid 
                topSlot={
                    <Typography variant='body2' sx={{bgcolor:'listToBlock.main', borderRadius:'8px', p:1, display:'flex', alignItems:'center', gap:1}} color='gray'>
                        <ErrorOutlineIcon color='warning'/>приудалении сотрудника, удаляются все данные связанный с ним.
                    </Typography>
                }
                columns={columnsSotrudniki} 
                tableData={Sotrudnik}
                collectionName={`Sotrudnik`} 
                actionEdit={memoizedHandleEditRow}
                actionDelete={handleDeleteRowBD}
                actionAdd={()=>handleAddInTable(`Sotrudnik`,DialogAddSotrudnik)}
            />
        </div>
    )
})
export default React.memo(Sotrudniki)