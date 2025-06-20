import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useState, useEffect, useCallback } from 'react';
import { TextField, Box, FormControl, Autocomplete } from '@mui/material';
import { useSotrudnik, useUsers } from '../../../websocket/WebSocketContext.jsx'
import { useDialogs } from '@toolpad/core/useDialogs';
import getWhoId from '../../users/GetWhoID.jsx';
import CAutoCompleate from '../../utils/CAutoCompleate.jsx';
import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

export default function DialogZapros({ payload, open, onClose }) {
  const Sotrudnik = useSotrudnik()
  const Users = useUsers()  

  const [sotrudnik, setSotrudnik] = useState('');
  const [deistvie, setDeistvie] = useState('');
  const [prava, setPrava] = useState('');
  const [obosnovanie, setObosnovanie] = useState('');
  const [dataDob, setDataDob] = useState(dayjs(new Date()))
  const [descrip, setDescrip] = useState('');

  const dialogs = useDialogs();

  // Заполняем начальные данные при открытии окна
  useEffect(() => {
    if (payload) {        
        setSotrudnik(payload._sotr._id || '');
        setDescrip(payload.descrip || '');
        setPrava(payload.prava || '');
        setObosnovanie(payload.obosnovanie || '');
        setDeistvie(payload.deistvie || '');
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

            {/* прика3 и его дата */}
            <FormControl sx={{flex:`1`}}>
                <Autocomplete
                    value={deistvie}
                    onChange={(event, newValue) => {
                        setDeistvie(newValue);
                    }}
                    id="controllable-states-demo"
                    options={[`Разблокировка`,`Изменение прав`,`Создание учетки`, 'Разблокировка и сброс пароля', 'Сброс пароля']}
                    renderInput={(params) => <TextField {...params} label="Действие*" />}
                />
            </FormControl>
            <FormControl sx={{flex:`1`}}>
                <Autocomplete
                    value={obosnovanie}
                    onChange={(event, newValue) => {
                        setObosnovanie(newValue);
                    }}
                    id="controllable-states-demo"
                    options={[`Докладная`,`Сообщение по GW (нач., зам. нач.)`,`Звонок начальника (зам. нач.)`]}
                    renderInput={(params) => <TextField {...params} label="Обоснование*" />}
                />
            </FormControl>
            <TextField
                title='Выбор прав'
                id="prava"
                label="Права"
                fullWidth
                value={prava}
                onChange={(event) => setPrava(event.target.value)}
            />
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
          disabled={!sotrudnik || !deistvie || !obosnovanie}
          onClick={async () => {
            const res = { 
              _sotr:sotrudnik, 
              deistvie, 
              prava,
              obosnovanie,
              descrip, 
              _who:getWhoId(payload, Users),
              data_dob:dataDob
            };
            if ([deistvie, sotrudnik, obosnovanie].every(Boolean)) {
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
