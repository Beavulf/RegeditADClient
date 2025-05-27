import { useMemo, useState, useEffect } from 'react';
import DialogUvolnenie from './DialogUvolnenie.jsx';
import MDataGrid from '../../DataGrid/MDataGrid.jsx';
import { useTableActions } from '../../../websocket/LayoutMessage.jsx';
import { useUvolnenie } from '../../../websocket/WebSocketContext.jsx'
import { Typography, Box, Button } from '@mui/material';
import SotrToBlockList from './SotrToBlockList.jsx';
import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

export default function Uvolnenie({router}) {
    // вызываем кастомный хук для даления строки из БД
    const { handleDeleteRowBD, handleAddInTable, handleEditRow } = useTableActions();
    const Uvolnenie = useUvolnenie()
    const [fioToUvolnenie, setFioToUvolnenie] = useState(JSON.parse(sessionStorage.getItem('fioToUvolnenie')))


    const columnsPerevod = useMemo(()=>
        [
            { field: '_sotr', headerName: 'ФИО',  flex:0.7,
                valueGetter: (params) => params?.fio || ''
            }, 
            { field: 'prikaz', headerName: 'Приказ',flex:0.3},
            { field: 'data_prikaza', headerName: 'Дата приказа',flex:0.3,
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
            { field: 'data_uvol', headerName: 'Дата увольнения',flex:0.4,
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
            { field: 'data_dob', headerName: 'Дата доб.',flex:0.4,
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
            { field: 'descrip', headerName: 'Описание', flex:0.3, },
        ],[]
    ) 

    return (
        <Box className='animated-element' sx={{display:'flex', minWidth:'0', gap:1, height:'100%',}}>
          
            <Box sx={{flex:1, height:'100%', minWidth:0}}>
              {/* описание по ком отфильтровано с кнопкой очистки */}
              <Box sx={{display:'flex', alignItems:'center', justifyContent:'space-between', bgcolor:'#9c92921d', padding:0.5, borderRadius:'8px'}}>
                <Typography variant='body1' color='gray'>
                  Отфильтровано по: {fioToUvolnenie?.fio} | приказ: {fioToUvolnenie?.prikaz}
                </Typography>
                <Button onClick={()=>setFioToUvolnenie(()=>{
                  sessionStorage.removeItem('fioToUvolnenie')
                  return null
                })} title='Очистить фильтр'>
                  Очистить
                </Button>
              </Box>
              {/* таблица */}
              <MDataGrid 
                  columns={columnsPerevod} 
                  tableData={Uvolnenie.sort((a, b) => dayjs(b.data_dob).valueOf() - dayjs(a.data_dob).valueOf())
                    .filter(el=>fioToUvolnenie !== null ? (fioToUvolnenie?.fio === el._sotr.fio && fioToUvolnenie?.prikaz === el.prikaz) : true)}
                  collectionName={`Uvolnenie`} 
                  actionEdit={(id,oldData,collectionName)=>handleEditRow(id,oldData,collectionName,DialogUvolnenie)}
                  actionDelete={handleDeleteRowBD}
                  actionAdd={()=>handleAddInTable(`Uvolnenie`,DialogUvolnenie)}
              />
            </Box>
            {/* список сотрудников на блокировку */}
            <Box sx={{flex: '0 0 300px'}}>
              <SotrToBlockList onSelect={
                (fio)=>{setFioToUvolnenie(fio)}
              }/>
            </Box>
        </Box>
    )
}