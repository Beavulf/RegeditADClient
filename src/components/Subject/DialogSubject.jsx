import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useState, useEffect } from 'react';
import { TextField, Box } from '@mui/material';
import { useUsers } from '../../websocket/WebSocketContext.jsx'
import { useDialogs } from '@toolpad/core/useDialogs';
import getWhoId from '../users/GetWhoID.jsx';

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

export default function DialogSubject({ payload, open, onClose }) {
  const Users = useUsers()
  const dialogs = useDialogs();

  const [name, setName] = useState('');
  const [dataDob, setDataDob] = useState(dayjs(new Date()))
  const [descrip, setDescrip] = useState('');

  // Заполняем начальные данные при открытии окна
  useEffect(() => { 
    if (payload) {        
      setName(payload.name || '');
      setDataDob(dayjs(new Date(payload.data_dob)) || dayjs(new Date()));
      setDescrip(payload.descrip || '');
    }
  }, [payload]);

  return (
    <Dialog fullWidth open={open} onClose={() => onClose()}>
      <DialogTitle>Редактирование людей:</DialogTitle>
      <DialogContent>
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
      </DialogContent>

      <DialogActions>
        <Button onClick={() => onClose()}>Отмена</Button>
        <Button
          title="Отправить запрос на сервер"
          onClick={async () => {
            const res = { 
                name,
                descrip,
                _who:getWhoId(payload, Users),
                data_dob:dataDob
            };
            if (name.length > 0) {               
                onClose(res);                
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
