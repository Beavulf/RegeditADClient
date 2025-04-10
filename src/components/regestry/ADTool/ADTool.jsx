import { useMemo, useState, useEffect } from 'react';
// import DialogADTool from './DialogADTool.jsx';
import MDataGrid from '../../DataGrid/MDataGrid.jsx';
import { useTableActions } from '../../../websocket/LayoutMessage.jsx';
import { useAdtool, useWebSocketContext } from '../../../websocket/WebSocketContext.jsx'
import { useSnackbar } from 'notistack';//
import {
    Button, 
    Typography, 
    TextField, 
    Box, 
    IconButton,
} from '@mui/material'
import Fade from '@mui/material/Fade';
import Collapse from '@mui/material/Collapse';
import InputAdornment from '@mui/material/InputAdornment';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

const SERVER_ADDRESS = import.meta.env.VITE_SERVER_ADDRESS
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT

export default function ADTool() {
    // вызываем кастомный хук для даления строки из БД
    const { handleDeleteRowBD, handleAddInTable, handleEditRow } = useTableActions();
    const {sendJsonMessage} = useWebSocketContext();
    const ADTool = useAdtool()
    const [intervalCheck, setIntervalCheck] = useState(false)
    const [interval, setInterval] = useState(0)
    const [logFetch, setLogFetch] = useState('')
    const [fetchIntervalTime, setFetchIntervalTime] = useState('')
    const { enqueueSnackbar } = useSnackbar(); 

    // получение данных из выбранной таблицы SQL
    async function getSqlData(tableName) {
        try {
            const response = await fetch(`http://${SERVER_ADDRESS}:${SERVER_PORT}/getsqldata?tableName=${tableName}`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );
            if (!response.ok) {
                throw new Error('Ошибка получения SQL');
            }
            const data = await response.json();
            setLogFetch(data.message)
            // console.log(data);
            
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
        }
    }
    
    // запрос на запуск (обнолвения) интервала и его вреемени
    async function startUpdateInterval(time) {
        try {
            const response = await fetch(`http://${SERVER_ADDRESS}:${SERVER_PORT}/startinterval?time=${time}`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );
            if (!response.ok) {
                throw new Error('Ошибка получения SQL');
            }
            const data = await response.json();
            setLogFetch(data.message)
            // console.log(data);
        } catch (error) {
            console.error('Ошибка запроса на старт интервала:', error);
        }
    }

    // запрос на остановку (обнолвения) интервала
    async function stopInterval() {
        try {
            const response = await fetch(`http://${SERVER_ADDRESS}:${SERVER_PORT}/stopinterval`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );
            if (!response.ok) {
                throw new Error('Ошибка получения SQL');
            }
            const data = await response.json();
            setLogFetch(data.message)
            // console.log(data);
        } catch (error) {
            console.error('Ошибка запроса на старт интервала:', error);
        }
    }

    // получение времени интервала
    async function getIntervalTime() {
        try {
            const response = await fetch(`http://${SERVER_ADDRESS}:${SERVER_PORT}/intervaltime`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );
            if (!response.ok) {
                throw new Error('Ошибка получения времени интервала SQL');
            }
            const data = await response.json();
            setFetchIntervalTime(data.message)
            // console.log(data.message);
        } catch (error) {
            console.error('Ошибка запроса получении времени интервала:', error);
        }
    }
    getIntervalTime()

    // принудительная загрузка данных
    async function getDataNow() {
        try {
            const response = await fetch(`http://${SERVER_ADDRESS}:${SERVER_PORT}/getdatanow`,
                {
                    method: 'GET',
                    headers: {

                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );
            if (!response.ok) {
                throw new Error('Ошибка получения времени интервала SQL');
            }
            const data = await response.json();
            setLogFetch(data.message)
        } catch (error) {
            console.error('Ошибка запроса получении времени интервала:', error);
        }
    }

    async function loadDataNow() {
        await getDataNow()
        await sendJsonMessage({
            type: 'getCollectionMongoose',
            data: { collection: 'ADTool' }
        });
        enqueueSnackbar(`Загрузка данных произведена, УСПЕШНО.`, { variant: `success` });
    }

    const columnsPerevod = useMemo(()=>
        [
            { field: 'id_userA', headerName: 'ID',  flex:0.1, }, 
            { field: 'fio', headerName: 'ФИО',flex:0.3},
            { field: 'date_s', headerName: 'Дата нач.',flex:0.3,
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
            { field: 'date_p', headerName: 'Дата конц.',flex:0.3,
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
            { field: 'prikaz', headerName: 'Приказ',  flex:0.3, }, 
            { field: 'who', headerName: 'Кто',  flex:0.3, }, 
            { field: 'date_z', headerName: 'Дата доб.',flex:0.3,
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
            { field: 'descriptions', headerName: 'Тип',  flex:0.3, }, 
        ],[]
    ) 
    function updateIntervalTime () {
        setIntervalCheck(true);
    }
    const cancelUpdateInterval = () =>{
        setInterval(0)
        setIntervalCheck(false);
    }
    const successUpdateInterval = async () =>{
        if (interval > 0) {
            await startUpdateInterval(interval)
            setIntervalCheck(false);
            enqueueSnackbar(`Интервал успешно изменен (${interval} ч.).`, { variant: `success` });
            return
        }
        enqueueSnackbar(`Интервал должен быть больше 0`, { variant: `error` });
    }
    return (
        <div className='animated-element'>
            <Box sx={{display:'flex', alignItems:'start', gap:'5px'}}>
                <Box sx={{display:'flex'}}>
                    <Typography>Принудительно загрузить:</Typography>
                    <Button sx={{height:'40px'}} variant='outlined' title='Загрузить не дожидаясь автоматического обновления' onClick={loadDataNow}>загр.</Button>
                </Box>
                <Box sx={{display:'flex', alignItems:'center',}}>

                    <TextField 
                        onClick={updateIntervalTime}
                        label = 'Интервал'
                        title='Установить интервал обновления данных (часы)'
                        sx={{width:'90px', margin:'0 5px'}}
                        size='small'
                        type='number'
                        slotProps={{
                            input: {
                                startAdornment: <InputAdornment position="start">ч</InputAdornment>,
                            },
                        }} 
                        value={interval}
                        onChange={(e)=>setInterval(e.target.value)}
                        />
                    <Collapse orientation='horizontal' in={intervalCheck}> 
                        <Box sx={{display:'flex', alignItems:'center'}}>
                            <IconButton onClick={successUpdateInterval} color='success' title='Сохранить (отсчет интервала пойдет с момента сохранения)'>
                                <CheckIcon></CheckIcon>
                            </IconButton>
                            <IconButton onClick={cancelUpdateInterval} color='error' title='Отменить'>
                                <CloseIcon></CloseIcon>
                            </IconButton>
                        </Box>
                    </Collapse>
                       
                </Box>
                <TextField
                    value={logFetch}
                    fullWidth
                    size='small'
                    label='Сообщения'
                    helperText={'Часов интервала установлено: '+fetchIntervalTime}
                    multiline={true}
                >
                </TextField> 
                <Box sx={{display:'flex', alignItems:'center', border:'1px solid gray', borderRadius:'8px'}}>
                    <IconButton color='success' title='Запустить обновление данных из SQL' 
                        onClick={()=>{
                            startUpdateInterval(12); 
                            enqueueSnackbar(`Обновление успешно запущено с интервалом 12ч.`, { variant: `success` });
                        }}
                    >
                        <PlayCircleFilledWhiteIcon></PlayCircleFilledWhiteIcon>
                    </IconButton>
                    <IconButton color='error' title='Остановить обновление данных из SQL' 
                        onClick={()=>{
                            stopInterval();
                            enqueueSnackbar(`Обновление ОСТАНОВЛЕНО.`, { variant: `warning` });
                        }}
                    >
                        <StopCircleIcon></StopCircleIcon>
                    </IconButton>
                </Box>
                
            </Box>

            <MDataGrid 
                columns={columnsPerevod} 
                tableData={ADTool}
                collectionName={`ADTool`} 
                actionEdit={()=>enqueueSnackbar(`Недоступно для этой таблицы.`, { variant: `warning` })}
                actionDelete={()=>enqueueSnackbar(`Недоступно для этой таблицы.`, { variant: `warning` })}
            />
        </div>
    )
}