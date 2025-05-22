import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useState, useEffect } from 'react';
import { TextField, Box } from '@mui/material';
import { useUsers, useWebSocketContext } from '../../websocket/WebSocketContext.jsx'
import { useDialogs } from '@toolpad/core/useDialogs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

export default function DialogProdlenie({ payload, open, onClose }) {
  const Users = useUsers()
  const { sendJsonMessage } = useWebSocketContext()
  const dialogs = useDialogs();

  const [contract, setContract] = useState('');

  const [prikaz, setPrikaz] = useState('Эл. почта');
  const [dateDover, setDateDover] = useState(null);
  const [dateContr, setDateContr] = useState(null);
  const [datePrikaz, setDatePrikaz] = useState(dayjs(new Date()));
  const [dataDob, setDataDob] = useState(dayjs(new Date()))
  const [descrip, setDescrip] = useState(''); 

  // Заполняем начальные данные при открытии окна
  useEffect(() => { 
    if (payload) {  
      if (payload.addcontext) {  
        setContract(payload.addcontext._contr);
      } else {
        setDateDover(dayjs(new Date(payload.ndata_dov)) || null);
        setDateContr(dayjs(new Date(payload.ndata_contr)) || null);
        setDatePrikaz(dayjs(new Date(payload.data_prikaza)) || null);
        setPrikaz(payload.prikaz || '');
        setDataDob(dayjs(new Date(payload.data_dob)) || dayjs(new Date()));
        setDescrip(payload.descrip || '');
      }    
    }
  }, [payload]);

  return (
    <Dialog fullWidth open={open} onClose={() => onClose()}>
      <DialogTitle>Добавление продления:</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 2, padding:1,}}>
          <DatePicker 
            sx={{flex:1}}
            label="Дата контракта"
            value={dateContr} 
            onChange={(newValue) => {setDateContr(newValue)}} 
          />
          <DatePicker 
              sx={{flex:1}}
              label="Дата доверенности"
              value={dateDover} 
              onChange={(newValue) => {setDateDover(newValue)}} 
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, padding:1}}>
          <TextField
              id="prikaz"
              label="Приказ*"
              value={prikaz}
              fullWidth={true}
              onChange={(event) => setPrikaz(event.target.value)}
          />
          <DatePicker 
              label="Дата приказа*"
              value={datePrikaz} 
              onChange={(newValue) => {setDatePrikaz(newValue)}} 
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, padding:1}}>
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
              ndata_dov:dateDover,
              ndata_contr:dateContr,
              data_prikaza:datePrikaz,
              prikaz, 
              _contr:contract, 
              descrip,
              _who:(payload?._who && payload?._who?._id) || Users.find(el=>el.address === localStorage.getItem(`clientIp`))._id,
              data_dob:dataDob
            };
            if (prikaz.length > 0 && (dateContr != null || dateDover != null)) {    
              const message = {
                type: 'updateInCollection',
                data: {
                  collection: `Contract`,
                  filter: { _id: contract },
                  value: { data_contr: dateContr!=null ? dateContr : undefined, data_dover: dateDover!=null ? dateDover : undefined, time_edit:dayjs(new Date())  },
                },
              }
              await sendJsonMessage(message)
              await onClose(res); 
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
