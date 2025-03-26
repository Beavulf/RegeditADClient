import { usePdoka } from '../../../websocket/WebSocketContext.jsx'
import { Typography, Box, IconButton, Badge, Button, Checkbox } from '@mui/material'
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import React, { useState, useMemo, useEffect, memo } from 'react';
import MDataGrid from '../../DataGrid/MDataGrid.jsx';
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';
import { useTableActions } from '../../../websocket/LayoutMessage.jsx';
import DialogDoka from './DialogDoka.jsx'
import DownloadIcon from '@mui/icons-material/Download';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Fade from '@mui/material/Fade';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ExportExcel from './Report.jsx'

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

const SERVER_ADDRESS = import.meta.env.VITE_SERVER_ADDRESS
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT

const Doka = React.memo(function Doka() {
    const Pdoka = usePdoka()
    const [filter, setFilter] = useState(false);
    const [overdueRows, setOverdueRows] = useState([]);  
    const [allPdoka, setAllPdoka] = useState([])  
    const [allTime, setAllTime] = useState(false)
    const [fadeReporCheck, setFadeReporCheck] = useState(false)
    const [startDate, setStartDate] = useState(dayjs(new Date()))
    const [endDate, setEndDate] = useState(dayjs(new Date()))
    const [allDataCheck, setAllDataCheck] = useState(false)

    async function getAllPdoka() {
        try {
          if (!allTime){
            const response = await fetch(`http://${SERVER_ADDRESS}:${SERVER_PORT}/allpdoka`);
            if (!response.ok) {
              throw new Error('Ошибка получения Фидбеков');
            }
            const data = await response.json();            
            setAllPdoka(data); // Сохраняем данные в состоянии
            setAllTime(true)
          } else {
            setAllTime(false)
            setAllPdoka([])
          }
            
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
        }
    }
    
    const getTreeData = (items) => {
        return items.reduce((acc, item) => {
            const date = dayjs(item.data_prikaza);
            const year = date.format("YYYY");
            const month = date.format("MMMM");
            const day = date.format("DD MMMM");
      
            if (!acc[year]) {
                acc[year] = {};
            }
            if (!acc[year][month]) {
                acc[year][month] = {};
            }
            if (!acc[year][month][day]) {
                acc[year][month][day] = [];
            }
            acc[year][month][day].push(item);
            return acc;
        }, {});
    };
    const TreeViewComponent = ({ data }) => {
        const treeData = useMemo(() => getTreeData(data), [data]);
      
        return (
          <SimpleTreeView aria-label="Дерево записей">
            {Object.entries(treeData).map(([year, months]) => (
              <TreeItem itemId={year} label={year} key={year}>
                {Object.entries(months).map(([month, days]) => (
                  <TreeItem itemId={`${year}-${month}`} label={month} key={month}>
                    {Object.entries(days).map(([day, items]) => (
                      <TreeItem itemId={`${year}-${month}-${day}`} label={day} key={day}>
                        {items.map((item) => (
                          <TreeItem
                            itemId={item._id}
                            key={item._id}
                            label={
                              <Box sx={{display:'flex'}}>
                                (<Typography color='aqua'>{item._pto.name}</Typography>)|<Typography color={item.type === 'Предоставить' ? 'lightGreen' : '#ed5353b0'}> {item.type} </Typography>| <strong> {item._sotr.fio} </strong> (<Typography color='aqua'>{item.lnp}</Typography>) - {item.obosnovanie} - <Typography color='lightBlue'>{item._who_do.name}</Typography>
                              </Box>
                            }
                          />
                        ))}
                      </TreeItem>
                    ))}
                  </TreeItem>
                ))}
              </TreeItem>
            ))}
          </SimpleTreeView>
        );
    }

    useEffect(() => {
      if (Pdoka.length > 0) {
        const filteredDocuments = Pdoka.filter(doc => {
          return dayjs(doc.data_prikaza).isBefore(dayjs().subtract(2, 'day')) && doc.obosnovanie === 'ДЗ по GW';
        });
        // Если просроченных документов нет, сбрасываем фильтр
        if (filteredDocuments.length === 0) {
          setFilter(false);
        }
        setOverdueRows(filteredDocuments);
      } else {
        setOverdueRows([]);
      }
    }, [Pdoka]);

    // вызываем кастомный хук для даления строки из БД
    const { handleDeleteRowBD, handleAddInTable, handleEditRow } = useTableActions();
  
    const columnsSotrudniki = useMemo(()=>
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
    
    function checkLoadAllData() {
      setAllDataCheck(prev=>{
        if (!prev){
          setStartDate(null);
          setEndDate(null);
          return !prev
        }
        if (prev) {
          setStartDate(dayjs(new Date()));
          setEndDate(dayjs(new Date()));
          return !prev
        }
      })
    }

    return (
        <div className='animated-element' style={{flex:`1`, textAlign:`start`}}>
          <Box sx={{display:`flex`, alignItems:`center`, gap:1}}>
              <Typography variant="h5">Просроченные</Typography>
              <Badge badgeContent={overdueRows.length} color="secondary" max={99}>
                  <IconButton title='Права которым не прописали приказ больше 2-х дней назад'
                  sx={{}}
                    onClick={()=>{
                        if (overdueRows.length>0){
                            setFilter((prev)=>!prev) 
                        }
                    }}
                  >
                  <ReportGmailerrorredIcon sx={{color:overdueRows.length>0 ?`#e03d3d` : `green`, bgcolor:filter && 'lightGray' || '', borderRadius:'8px'}}/>
                  </IconButton>
              </Badge>
              <Button sx={{}} variant={allTime ? 'contained' : 'text'} onClick={getAllPdoka} title='Получить список за все время отсортированный сразу по годам, месяцам, дням (дата выполнения).'>за все время</Button>
              
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
                  
                >excel</Button>
              </Box>

          </Box>
            
          {!allTime ?
            <MDataGrid 
                columns={columnsSotrudniki} 
                tableData={!filter && Pdoka || Pdoka.filter(doc => {
                    return dayjs(doc.data_prikaza).isBefore(dayjs().subtract(2, 'day')) && doc.obosnovanie === 'ДЗ по GW';
                  }).sort((a, b) => dayjs(b.data_dob).valueOf() - dayjs(a.data_dob).valueOf())}
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