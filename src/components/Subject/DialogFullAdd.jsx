import { useUsers, useWebSocketContext } from '../../websocket/WebSocketContext.jsx'
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useState } from 'react';
import { TextField, Box, Typography } from '@mui/material';
import { useDialogs } from '@toolpad/core/useDialogs';
import getWhoId from '../users/GetWhoID.jsx';

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

export default function DialogFullAdd({ payload, open, onClose }) {
  const { sendJsonMessage } = useWebSocketContext()
  const Users = useUsers()
  const dialogs = useDialogs();

  const [name, setName] = useState('');
  const [nameCom, setNameCom] = useState('');
  const [unp, setUnp] = useState('');

  const [dataDob, setDataDob] = useState(dayjs(new Date()))
  const [descrip, setDescrip] = useState('');
  const [descripCom, setDescripCom] = useState('');

  return (
    <Dialog fullWidth open={open} onClose={() => onClose()}>
      <DialogTitle>Добавление Субъекта и Компании:</DialogTitle>
      <DialogContent>
        <Typography>Субъект</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding:1}}>
            <Box sx={{display:`flex`, gap:1}}>
                <TextField
                    sx={{flex:1}}
                    id="name"
                    label="ФИО*"
                    fullWidth
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                />                    
            </Box>
            <TextField
                id="descrip"
                label="Описание"
                fullWidth
                value={descrip}
                onChange={(event) => setDescrip(event.target.value)}
            /> 
        </Box>
        <hr />
        <Typography>Компания</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding:1}}>
            <Box sx={{display:`flex`, gap:1}}>
                <TextField
                    sx={{flex:1}}
                    id="nameCom"
                    label="Наименование*"
                    fullWidth
                    value={nameCom}
                    onChange={(event) => setNameCom(event.target.value)}
                />
                <TextField
                    sx={{flex:0.3}}
                    id="unp"
                    label="УНП*"
                    fullWidth
                    value={unp}
                    onChange={(event) => setUnp(event.target.value)}
                />      
                 
            </Box>
            <TextField
                id="descripCom"
                label="Описание"
                fullWidth
                value={descripCom}
                onChange={(event) => setDescripCom(event.target.value)}
            /> 
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => onClose()}>Отмена</Button>
        <Button
          title="Отправить запрос на сервер"
          onClick={async () => {
            const resSubj = { 
                name,
                descrip,
                _who:getWhoId(payload, Users),
                data_dob:dataDob
            };
            const resCom = { 
                name:nameCom,
                unp,
                descrip:descripCom,
                _who:getWhoId(payload, Users),
                data_dob:dataDob
            };
            
            if (name.length > 0 && nameCom.length > 0 && unp.length >0) {  
                const message = {
                    type: 'insertInToCollection',
                    data: {
                      collection: `Subject`,
                      body: { ...resSubj, is_locked: false },
                    },
                };
                const messageCom = {
                    type: 'insertInToCollection',
                    data: {
                      collection: `Company`,
                      body: { ...resCom, is_locked: false }, 
                    },
                };
                sendJsonMessage(message);
                sendJsonMessage(messageCom);
                onClose();                
            }
            else {
                await dialogs.alert(`Корректно заполните все поля.`)
            }
          }}
        >
          Отправить
        </Button>
      </DialogActions>

    </Dialog>
  );
}
