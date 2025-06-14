import { Button, Fade, Box, TextField } from '@mui/material';
import { memo, useState } from 'react';
import { useDialogs } from '@toolpad/core/useDialogs';
import { useWebSocketContext } from '../../../websocket/WebSocketContext.jsx';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const AnullContract = ({ setPrikazAnull, setDateAnull, prikazAnull, dateAnull, idContract }) => {
    const dialogs = useDialogs();
    const { sendJsonMessage } = useWebSocketContext();

    const [fade, setFade] = useState(false)

    // аннулирование контракта
    const handleAnullClick = async () => {
        if (prikazAnull.length > 0 && dateAnull!=null) {
        const confirmed = await dialogs.confirm(`Аннулировать контракт ?`, {
            okText: 'Да',
            cancelText: 'Нет',
        });
        if (confirmed) {
            const message = {
            type: 'updateInCollection',
            data: {
                collection: 'Contract',
                filter: { _id: idContract },
                value: { prikaz_anull: prikazAnull, data_anull: dateAnull, anull: true, time_edit: new Date() },
            },
            };
            await sendJsonMessage(message);
        }
            setFade(false);
        } else {
            dialogs.alert('Заполните поля "Приказ аннулирования" и "Дата аннулирования"!');
        }
    }

    return (
        <Box sx={{display:'flex', gap:1, alignItems:'center', margin:'0.5rem 0'}}>
            <Button variant={fade === false ? 'outlined' : 'contained'} sx={{height:'55px'}} color='error' onClick={()=>setFade((prev)=>!prev)}>
                аннулировать
            </Button>
                <Fade in={fade}>
                <Box sx={{display:'flex', gap:1, alignItems:'center'}}>
                    <TextField
                        id="prikaz-anull"
                        label="Приказ"
                        fullWidth
                        value={prikazAnull}
                        onChange={(event) => setPrikazAnull(event.target.value)}
                    />
                    <DatePicker 
                        label="Дата аннулирования"
                        value={dateAnull} 
                        onChange={(newValue) => {setDateAnull(newValue)}} 
                    />
                    <Button variant='contained' sx={{height:'55px'}} onClick={()=>{handleAnullClick(); }}>ok</Button>
                </Box>
                </Fade>
        </Box>
    )
}

export default memo(AnullContract)