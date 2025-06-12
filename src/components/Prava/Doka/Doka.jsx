import { usePdoka } from '../../../websocket/WebSocketContext.jsx'
import { Typography, Box, IconButton, Badge, Button, Checkbox } from '@mui/material'
import React, { useState, useMemo, useEffect, memo, useCallback } from 'react';
import MDataGrid from '../../DataGrid/MDataGrid.jsx';
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';
import { useTableActions } from '../../../websocket/LayoutMessage.jsx';
import DialogDoka from './DialogDoka.jsx'
import CloseIcon from '@mui/icons-material/Close';
import Fade from '@mui/material/Fade';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ExportExcel from './Report.jsx'
import { useSnackbar } from 'notistack';
import api from '../../../apiAxios/Api.jsx';
import TreeViewComponent from './TreeView/TreeViewComponent.jsx';
import SimCardDownloadIcon from '@mui/icons-material/SimCardDownload';

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

const SERVER_ADDRESS = import.meta.env.VITE_SERVER_ADDRESS
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT

const Doka = React.memo(function Doka() {
    // вызываем кастомный хук для даления строки из БД
    const { handleDeleteRowBD, handleAddInTable, handleEditRow } = useTableActions();
    const Pdoka = usePdoka()
    const { enqueueSnackbar } = useSnackbar(); 

    const [filter, setFilter] = useState(false);
    const [overdueRowsCount, setOverdueRowsCount] = useState([]);  
    const [allPdoka, setAllPdoka] = useState([])  
    const [allTimeSelected, setAllTimeSelected] = useState(false)
    const [fadeReporCheck, setFadeReporCheck] = useState(false)
    const [startDate, setStartDate] = useState(dayjs(new Date()))
    const [endDate, setEndDate] = useState(dayjs(new Date()))
    const [allDataCheck, setAllDataCheck] = useState(false)
    const [isLoad, setIsLoad] = useState(false)
    
    const getAllPdoka = useCallback(async () => {
        if (allTimeSelected) {
            setAllTimeSelected(false);
            setAllPdoka([]);
            return;
        }
        try {
            setIsLoad(true);
            const response = await api.get(`http://${SERVER_ADDRESS}:${SERVER_PORT}/allpdoka`);
            
            if (response.statusText !== 'OK') {
                throw new Error('Ошибка получения всех данных таблицы Дока НАСТД');
            }

            const data = await response.data;
            setAllPdoka(data);
            setAllTimeSelected(true);
        } catch (error) {
            enqueueSnackbar('Ошибка при запросе к серверу.', { variant: 'error' });
            console.error('Ошибка запроса на сервер для получение всех данных Дока НАСТД:', error);
        } finally {
            setIsLoad(false);
        }
    }, [allTimeSelected, setAllPdoka, setAllTimeSelected, setIsLoad, enqueueSnackbar]);
    
    // условие на проверку просроченных документов
    const isOverdueDocument = useCallback((doc) => 
      dayjs(doc.data_prikaza).isBefore(dayjs().subtract(2, 'day')) && 
      doc.obosnovanie === 'ДЗ по GW',
    []);
  
    // фильтрация просроченных документов
    const filteredDocuments = useMemo(() => 
      Pdoka.filter(isOverdueDocument),
    [Pdoka, isOverdueDocument]);

    // постоянная проверка просроченных документов
    useEffect(() => {
      if (filteredDocuments.length === 0) {
        setFilter(false);
      }
      setOverdueRowsCount(filteredDocuments.length);
    }, [filteredDocuments]);

    const columnsPDoka = useMemo(()=>
        [
            { field: '_id', headerName: 'ID', width: 150, flex:0.3, hide:true },
            
            { field: '_pto', headerName: 'ПТО',flex:0.2,
                valueGetter: (params) => params?.name || ''},
            { field: '_sotr', headerName: 'ФИО',  flex:0.5,
                valueGetter: (params) => params?.fio || ''
            },  
            { field: 'type', headerName: 'Действие', flex:0.3 },
            { field: 'lnp', headerName: 'ЛНП', flex:0.2,},
            { field: 'obosnovanie', headerName: 'Обоснование', width: 150, flex:0.3, },
            { field: 'data_prikaza', headerName: 'Д.Приказа', width: 150, flex:0.25, 
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
            { field: 'data_dob', headerName: 'Добавлено', width: 150, flex:0.3,
                type: 'date',
                valueGetter: (params) => {
                    const date = dayjs(params);
                    return date.isValid() ? date.toDate() : null;
                },
                renderCell: (params) => {
                    return dayjs(params.value).format('DD.MM.YYYY HH:mm');
                } 
            },
            { field: '_who', headerName: 'Кто доб.', width: 150, flex:0.2,
                valueGetter: (params) => params?.name || ''
            },
            { field: '_who_do', headerName: 'Кто вып.', width: 150, flex:0.2,
                valueGetter: (params) => params?.name || ''
            },
            { field: 'descrip', headerName: 'Описание', width: 150, flex:0.3, },
        ],[]
    ) 
    
    // установка и снятие флага для загрузки в эксель всего периода
    const checkLoadAllData = useCallback(() => {
      setAllDataCheck(prev => {
        const newValue = !prev;
        setStartDate(newValue ? null : dayjs());
        setEndDate(newValue ? null : dayjs());
        return newValue;
      });
    }, []);

    //фильтр просроченных документов
    const filteredPdoka = useMemo(()=>{
      if (filter){  
        return Pdoka.filter(doc => {
          return dayjs(doc.data_prikaza).isBefore(dayjs().subtract(2, 'day')) && doc.obosnovanie === 'ДЗ по GW';
        }).sort((a, b) => dayjs(b.data_dob).valueOf() - dayjs(a.data_dob).valueOf())
      }
      return Pdoka.sort((a, b) => dayjs(b.data_dob).valueOf() - dayjs(a.data_dob).valueOf())
    },[Pdoka, filter])
    
    return (
        <div className='animated-element' style={{flex:`1`, textAlign:`start`}}>
          <Box sx={{display:`flex`, alignItems:`center`, gap:1}}>
              <Typography variant="h5">Просроченные</Typography>
              <Badge badgeContent={overdueRowsCount} color="secondary" max={99}>
                  <IconButton title='Права которым не прописали приказ больше 2-х дней назад'
                  sx={{}}
                    onClick={()=>{
                        if (overdueRowsCount>0){
                            setFilter((prev)=>!prev) 
                        }
                    }}
                  >
                  <ReportGmailerrorredIcon sx={{color:overdueRowsCount>0 ?`#e03d3d` : `green`, bgcolor:filter && 'lightGray' || '', borderRadius:'8px'}}/>
                  </IconButton>
              </Badge>

              <Button loading={isLoad} variant={allTimeSelected ? 'contained' : 'outlined'} onClick={getAllPdoka} 
                title='Получить список за все время отсортированный сразу по годам, месяцам, дням (дата выполнения).'
              >за все время</Button>
             
              <Box sx={{marginLeft:'auto', display:'flex', gap:1}}>
                <Fade in={fadeReporCheck}> 
                  <Box sx={{display:'flex', alignItems:'center', gap:1}}>
                    <DatePicker 
                      sx={{width:'150px'}}
                      label="Дата С"
                      value={startDate} 
                      onChange={(newValue) => {setStartDate(newValue)}} 
                    />
                    <DatePicker 
                      sx={{width:'150px'}}
                      label="Дата ПО"
                      value={endDate} 
                      onChange={(newValue) => {setEndDate(newValue)}} 
                    />

                    <Box sx={{display:'flex', alignItems:'center', border:'1px solid gray', borderRadius:'8px'}}>
                      <Checkbox title='За все время' checked={allDataCheck} onChange={checkLoadAllData}></Checkbox>
                      <ExportExcel startDate={startDate} endDate={endDate}></ExportExcel>
                      <IconButton onClick={()=>setFadeReporCheck(false)} size='large' color='error' title='Отменить'>
                          <CloseIcon></CloseIcon>
                      </IconButton>
                    </Box>

                  </Box>
                </Fade>
                <Button 
                  variant={fadeReporCheck && 'contained' || 'outlined'} 
                  title='Выгрузить в excel права за опр. период' 
                  onClick={()=>{setFadeReporCheck(prev=>!prev)}}
                ><SimCardDownloadIcon/>excel</Button>
              </Box>

          </Box>
            
          {!allTimeSelected ?
            <MDataGrid 
                columns={columnsPDoka} 
                tableData={filteredPdoka}
                collectionName={`Pdoka`} 
                actionEdit={async (id,oldData,collectionName)=> handleEditRow(id,oldData,collectionName,DialogDoka)}
                actionDelete={handleDeleteRowBD}
                actionAdd={()=>handleAddInTable(`Pdoka`,DialogDoka)}
            /> :
            <TreeViewComponent data={allPdoka} />
          }
            
        </div>
    )
})
export default memo(Doka)