import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useState, useEffect, useCallback } from 'react';
import { TextField, Box, FormControl, Autocomplete } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useSotrudnik, useUsers } from '../../../websocket/WebSocketContext.jsx';
import { useDialogs } from '@toolpad/core/useDialogs';
import getWhoId from '../../users/GetWhoID.jsx';
import CAutoCompleate from '../../utils/CAutoCompleate.jsx';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
dayjs.locale('ru');

export default function DialogAPS2020({ payload, open, onClose }) {
  const Sotrudnik = useSotrudnik()
  const Users = useUsers()  

  const [sotrudnik, setSotrudnik] = useState('');
  const [prikaz, setPrikaz] = useState('');
  const [dataPrikaza, setDataPrikaza] = useState(dayjs(new Date()))
  const [prava, setPrava] = useState('');
  const [dataDob, setDataDob] = useState(dayjs(new Date()))
  const [descrip, setDescrip] = useState('');

  const dialogs = useDialogs();

  // Заполняем начальные данные при открытии окна
  useEffect(() => {
    if (payload) {        
        setSotrudnik(payload._sotr._id || '');
        setDescrip(payload.descrip || '');
        setPrava(payload.prava || '');
        setPrikaz(payload.prikaz || '');
        setDataPrikaza(dayjs(new Date(payload.data_prikaza)) || dayjs(new Date()));
        setDataDob(dayjs(new Date(payload.data_dob)) || dayjs(new Date()));
    }
  }, [payload]);

  const handleChangeSotrudnik = useCallback((newValue) => {
    setSotrudnik(newValue ? newValue._id : '')
  }, []);

  return (
    <Dialog fullWidth open={open} onClose={() => onClose()}>
      <DialogTitle>Редактирование данных:</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: `20px`, padding:`20px 0` }}>

            {/* Поле для ввода ФИО */}
            <Box sx={{display:`flex`,gap:1}}>
              <CAutoCompleate
                  idComp={`sotrudnik`}
                  label={`Сотрудник*`}
                  memoizedData={Sotrudnik}
                  elementToSelect={sotrudnik}
                  onChangeElement={handleChangeSotrudnik}
              />
            </Box>

            <Box display={`flex`} gap={1}>
                <FormControl sx={{flex:`1`}}>
                    <TextField
                        id="prikaz"
                        label="Приказ(ДЗ)*"
                        fullWidth
                        value={prikaz}
                        onChange={(event) => setPrikaz(event.target.value)}
                    />
                </FormControl>
                <FormControl>
                    <DatePicker 
                        label="Дата приказа(ДЗ)*"
                        value={dataPrikaza} 
                        onChange={(newValue) => {setDataPrikaza(newValue)}} 
                    />
                </FormControl>
            </Box>

            <FormControl sx={{flex:`1`}}>
            <TextField
                id="prava"
                label="Права доступа*"
                fullWidth
                value={prava}
                onChange={(event) => setPrava(event.target.value)}
                multiline
                rows={10}
            />
            </FormControl>
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
          disabled={!sotrudnik || !prikaz || !prava}
          onClick={async () => {
            const res = { 
              _sotr:sotrudnik, 
              prikaz: prikaz, 
              data_prikaza: dataPrikaza,
              prava: prava,
              descrip, 
              _who:getWhoId(payload, Users),
              data_dob:dataDob
            };
            if ([prikaz, sotrudnik, prava].every(Boolean)) {
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
