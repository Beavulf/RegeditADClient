import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useState, useEffect } from 'react';
import { TextField, Box, FormControl, Autocomplete } from '@mui/material';
import { useSotrudnik, useUsers } from '../../../websocket/WebSocketContext.jsx'
import { useDialogs } from '@toolpad/core/useDialogs';

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

export default function DialogRevizor({ payload, open, onClose }) {
  const Sotrudnik = useSotrudnik()
  const Users = useUsers()  

  const [sotrudnik, setSotrudnik] = useState('');
  const [deistvie, setDeistvie] = useState('');
  const [obosnovanie, setObosnovanie] = useState('');
  const [dataDob, setDataDob] = useState(dayjs(new Date()))
  const [descrip, setDescrip] = useState('');

  const dialogs = useDialogs();

  // Заполняем начальные данные при открытии окна
  useEffect(() => {
    if (payload) {        
        setSotrudnik(payload._sotr._id || '');
        setDescrip(payload.descrip || '');
        setObosnovanie(payload.obosnovanie || '');
        setDeistvie(payload.deistvie || '');
        setDataDob(dayjs(new Date(payload.data_dob)) || dayjs(new Date()));
    }
  }, [payload]);

  return (
    <Dialog fullWidth open={open} onClose={() => onClose()}>
      <DialogTitle>Редактирование данных:</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: `20px`, padding:`20px 0` }}>

            {/* Поле для ввода ФИО */}
            <Box sx={{display:`flex`,gap:1}}>
                <FormControl fullWidth={true}> 
                    <Autocomplete
                        id="sotrudnik"
                        value={Sotrudnik.find(o => o._id === sotrudnik) || null}
                        onChange={(event, newValue) => {
                            setSotrudnik(newValue ? newValue._id : '')
                        }}
                        onInputChange={(event, value) => {
                            // Фильтруем варианты по введенному значению
                            const filteredOptions = Sotrudnik.filter(option => option.fio.toLowerCase().includes(value.toLowerCase()));
                            // Если после фильтрации остался только один вариант, автоматически выбираем его
                            if (filteredOptions.length === 1) {
                                setSotrudnik(filteredOptions[0]._id);
                                event?.target?.blur();
                            }                            
                        }}
                        options={Sotrudnik}
                        getOptionLabel={(option) => option.fio}
                        isOptionEqualToValue={(option, value) => option._id === value?._id}
                        title='Выбор сотрудника'
                        renderInput={(params) => (
                            <TextField
                            {...params}
                            label="Сотрудник*"
                            variant="outlined"
                            size='large'
                            />
                        )}
                    />
                </FormControl>
            </Box>

            {/* прика3 и его дата */}
            <FormControl sx={{flex:`1`}}>
                <Autocomplete
                    value={deistvie}
                    onChange={(event, newValue) => {
                        setDeistvie(newValue);
                    }}
                    id="controllable-states-demo"
                    options={[`Разблокировка`,`Создание учетки`, 'Разблокировка и сброс пароля', 'Сброс пароля']}
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
              _sotr:sotrudnik, 
              deistvie, 
              obosnovanie,
              descrip, 
              _who:(payload?._who && payload?._who?._id) || Users.find(el=>el.address === localStorage.getItem(`clientIp`))._id,
              data_dob:dataDob
            };
            if ([deistvie, sotrudnik, obosnovanie].every(value => value.length > 0)) {
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
