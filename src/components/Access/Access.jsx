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

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

export default function Access() {
    const { sendJsonMessage } = useWebSocketContext()
    const Access = useAccess()
    const [access, setAccess] = useState([])
    const [role, setRole] = useState(``)

    useEffect(()=>{
        setAccess(Access)
    },[Access])

    async function handleGetAccess(sotr) {
        if (role.length > 0) {
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
                console.error("Error sending message:", error);
            }
        }
    }
    async function handleCancelAccess(sotr) {
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
            console.error("Error sending message:", error);
        }
    }
    return (
        <Box>
            {access.map((item,index)=>{
                return (
                    <Paper elevation={6} key={index} sx={{display:`flex`, alignItems:`center`, justifyContent:`space-between`,padding:1, margin:1}}>
                        <Typography variant='h5'>
                            <span style={{color:`lightBlue`}}>Кому:</span> {item.address} | {item.login} - <span style={{color:`lightseaGreen`}}>{dayjs(new Date(item.data_dob)).format(`DD.MM.YYYY HH:mm`)}</span>
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
                            renderInput={(params) => <TextField {...params} label="Роль" />}
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
