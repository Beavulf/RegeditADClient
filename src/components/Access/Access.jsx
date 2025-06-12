import { useWebSocketContext, useAccess } from '../../websocket/WebSocketContext.jsx'
import {
    Button, 
    Typography, 
    TextField, 
    Box, 
    Paper, 
    Autocomplete,
} from '@mui/material'
import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

export default function Access() {
    const { sendJsonMessage } = useWebSocketContext()
    const Access = useAccess()
    const { enqueueSnackbar } = useSnackbar();

    const [access, setAccess] = useState([])
    const [role, setRole] = useState(``)

    // получение доступов после каждого их изменения
    useEffect(()=>{
        setAccess(Access)
    },[Access])

    // выдача доступа
    const handleGetAccess = async (sotr) => {
        if (role && role.length > 0) {
            const message = {
                type: 'insertInToCollection',
                data: {
                    collection: `Users`,
                    body: { role:role, name: sotr.login, address: sotr.address, is_locked: false, },
                },
            };
            const deleteItem = {
                type: 'deleteFromCollection',
                data: {
                    collection: `Access`,
                    filter: { _id: sotr._id }
                },
            }
            try {
                await sendJsonMessage(message); 
                await sendJsonMessage(deleteItem); 
            } catch (error) {
                enqueueSnackbar(`Ошибка при выдаче доступа: ${error.message}`, { variant: 'error' });
                console.error("Ошибка при выдаче доступа:", error);
            }
        } else {
            enqueueSnackbar(`Не выбрана роль`, { variant: 'error' });
        }
    }

    // отказ в доступе
    const handleCancelAccess = async (sotr) => {
        const message = {
            type: 'deleteFromCollection',
            data: {
                collection: `Access`,
                filter: { _id: sotr._id }
            },
        };
        try {
            await sendJsonMessage(message); 
        } catch (error) {
            enqueueSnackbar(`Ошибка при отказе в доступе: ${error.message}`, { variant: 'error' });
            console.error("Ошибка при отказе в доступе:", error);
        }
    }
    return (
        <Box>
            {access.map((item,index)=>{
                return (
                    <Paper elevation={1} key={index} sx={{display:`flex`, alignItems:`center`, justifyContent:`space-between`,padding:1, margin:1}}>
                        <Typography variant='h5' sx={{display:`flex`, alignItems:`center`, gap:1}}>
                            <Typography component="span" variant='h5' color="primary">Кому: </Typography> 
                            <Typography bgcolor={'rgba(128, 128, 128, 0.19)'} component="span" variant='h5' color="text">{item.address} | {item.login}</Typography>
                            <Typography component="span" variant='h5' sx={{color:`lightseaGreen`}}>{dayjs(new Date(item.data_dob)).format(`DD.MM.YYYY HH:mm`)}</Typography>
                        </Typography>
                        <Box sx={{display:`flex`, gap:1}}>
                        <Autocomplete
                            sx={{width:`200px`}}
                            size='small'
                            value={role}
                            onChange={(event, newValue) => {
                                setRole(newValue);
                            }}
                            id="select-role"
                            options={[`manager`,`admin`]}
                            renderInput={(params) => <TextField aria-readonly {...params} label="Роль" />}
                        />
                            <Button variant='contained' color='success' onClick={()=>{handleGetAccess(item)}}>Выдать</Button>
                            <Button variant='outlined' color='error' onClick={()=>{handleCancelAccess(item)}}>Отказать</Button>
                        </Box>
                    </Paper>
                )
            })}
        </Box>
    )
}
