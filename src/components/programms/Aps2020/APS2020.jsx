import { useMemo, useState } from 'react';
// import DialogSvodka from './DialogSvodka.jsx';
import MDataGrid from '../../DataGrid/MDataGrid.jsx';
import { useTableActions } from '../../../websocket/LayoutMessage.jsx';
import { useAPS2020 } from '../../../websocket/WebSocketContext.jsx';
import { Box, Button, Link, Typography } from '@mui/material';
import DialogAPS2020 from './DialogAPS2020.jsx';
import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');
export default function APS2020() {
    // вызываем кастомный хук для даления строки из БД
    const { handleDeleteRowBD, handleAddInTable, handleEditRow } = useTableActions();
    const APS2020 = useAPS2020();

    const columnsAPS2020 = useMemo(()=>
        [
            { field: '_sotr', headerName: 'ФИО',  flex:0.5,
                valueGetter: (params) => params?.fio || ''
            }, 
            { field: 'prikaz', headerName: 'Приказ(ДЗ)', flex:0.3},
            { field: 'data_prikaza', headerName: 'Дата приказа(ДЗ)',flex:0.3,
                type: 'date',
                valueGetter: (params) => {
                    const date = dayjs(params);
                    return date.isValid() ? date.toDate() : null;
                },
                renderCell: (params) => {
                    if (params.value) {
                        return dayjs(params.value).format('DD.MM.YYYY');
                    }
                    return null;
                },
            },
            { field: 'prava', headerName: 'Права доступа', flex:0.5},
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
    );

    const sortAPS2020 = useMemo(()=>{
        return APS2020.sort((a, b) => dayjs(b.data_dob).valueOf() - dayjs(a.data_dob).valueOf());
    },[APS2020]);


    
    // const topSlot = (
    //     <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
    //         <Link
    //             underline="hover"
    //             sx={{ ml: 1, cursor: 'pointer' }}
    //             onClick={()=>{
    //                 window.open('http://localhost:3000/files/aps', '_blank');
    //             }}
    //         >
    //             скачать файл с правами доступа
    //         </Link>
    //     </Box>
    // )

    return (
        <div className='animated-element'>
            <MDataGrid 
                // topSlot={topSlot}
                columns={columnsAPS2020} 
                tableData={sortAPS2020}
                collectionName={`APS2020`} 
                actionEdit={(id,oldData,collectionName)=>handleEditRow(id,oldData,collectionName,DialogAPS2020)}
                actionDelete={handleDeleteRowBD}
                actionAdd={()=>handleAddInTable(`APS2020`,DialogAPS2020)}
            />
        </div>
    )
}