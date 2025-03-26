import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState, useEffect } from 'react';
import { TextField, Box, FormControl, Autocomplete } from '@mui/material';
import { useSotrudnik, useOtdel, useUsers } from '../../../websocket/WebSocketContext.jsx'
import { useDialogs } from '@toolpad/core/useDialogs';

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

export default function DialogPriem({ payload, open, onClose }) {
  const Sotrudnik = useSotrudnik()
  const Otdel = useOtdel()
  const Users = useUsers()
  const dialogs = useDialogs();

  const [descrip, setDescrip] = useState('');
  const [action, setAction] = useState('');
  const [sotrudnik, setSotrudnik] = useState('');
  const [date, setDate] = useState(dayjs(new Date())); 
  const [dataDob, setDataDob] = useState(dayjs(new Date()))
  const [otdel, setOtdel] = useState('');
  const [user, setUser] = useState('');

  // Заполняем начальные данные при открытии окна
  useEffect(() => { 
    if (payload) {        
      setSotrudnik(payload._sotr._id || '');
      setDescrip(payload.descrip || '');
      setAction(payload.action || '');
      setDate(dayjs(new Date(payload.data)) || dayjs(new Date()));
      setDataDob(dayjs(new Date(payload.data_dob)) || dayjs(new Date()));
      setOtdel(payload._otdel._id || '');
      setUser(payload._who_do._id|| '');    
    }
  }, [payload]);

  return (
    <Dialog fullWidth open={open} onClose={() => onClose()}>
      <DialogTitle>Редактирование данных:</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: `20px`, padding:`20px 0` }}>

            {/* Поле для ввода ФИО */}
            <Box sx={{display:`flex`,gap:1}}>
                <FormControl sx={{flex:`1`}}>
                    <Autocomplete
                        id="sotrudnik"
                        value={Sotrudnik.find(o => o._id === sotrudnik) || null}
                        onChange={(event, newValue) => {
                            setSotrudnik(newValue ? newValue._id : ''); 
                            setOtdel(newValue ? newValue._otdel._id : ``) 
                        }}
                        onInputChange={(event, value) => {
                            const filteredOptions = Sotrudnik.filter(option => option.fio.toLowerCase().includes(value.toLowerCase()));
                            if (filteredOptions.length === 1) {
                                setSotrudnik(filteredOptions[0]._id);
                                setOtdel(filteredOptions[0] ? filteredOptions[0]._otdel._id : ``)
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
                            label="Сотрудники"
                            variant="outlined"
                            size='large'
                            />
                        )}
                    />
                </FormControl>
                <FormControl sx={{flex:`0.45`}}>
                    <Autocomplete
                        id="otdel"
                        value={Otdel.find(o => o._id === otdel) || null}
                        onChange={(event, newValue) => {
                            setOtdel(newValue ? newValue._id : '');
                        }}
                        onInputChange={(event, value) => {
                            const filteredOptions = Otdel.filter(option => option.name.toLowerCase().includes(value.toLowerCase()));
                            if (filteredOptions.length === 1) {
                                setOtdel(filteredOptions[0]._id);
                                event?.target?.blur();
                            }
                        }}
                        options={Otdel}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) => option._id === value?._id}
                        title='Выбор Отдела/ПТО'
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Отдел/ПТО"
                                variant="outlined"
                            />
                        )}
                    />
                </FormControl>
                
            </Box>

            {/* прика3 и его дата */}
            <Box sx={{display:`flex`, gap:1}}>
                <FormControl sx={{flex:`1`}}>
                    <Autocomplete
                        value={action}
                        onChange={(event, newValue) => {
                            setAction(newValue);
                        }}
                        id="controllable-states-demo"
                        options={[`Сброс пароля (начальник/ст.смены по GW)`,`Сброс пароля (тел. звонок)`,`Сброс пароля (зам. нач. по GW)`]}
                        renderInput={(params) => <TextField {...params} label="Действие" />}
                    />
                </FormControl>
                <DatePicker 
                    sx={{flex:`0.45`}}
                    label="Дата сброса"
                    value={date} 
                    onChange={(newValue) => {setDate(newValue)}} 
                />
            </Box>

            <Box sx={{display:`flex`, gap:1}}>
                <TextField
                    id="descrip"
                    label="Описание"
                    fullWidth
                    value={descrip}
                    onChange={(event) => setDescrip(event.target.value)}
                />
                <FormControl sx={{width:`400px`}}>
                    <Autocomplete
                        id="user"
                        value={Users.find(o => o._id === user) || null}
                        onChange={(event, newValue) => { setUser(newValue ? newValue._id : ''); }}
                        options={Users}
                        onInputChange={(event, value) => {
                            const filteredOptions = Users.filter(option => option.name.toLowerCase().includes(value.toLowerCase()));
                            if (filteredOptions.length === 1) {
                                setUser(filteredOptions[0]._id);
                                event?.target?.blur();
                            }
                        }}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) => option._id === value?._id}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Кто выполнял"
                                variant="outlined"
                                title='Выбрать того кто раздавал права'
                            />
                        )}
                    />
                </FormControl>
            </Box>

        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => onClose()}>Отмена</Button>
        <Button
          title="Отправить запрос на сервер"
          onClick={async () => {
            const res = { 
              _otdel:otdel,
              _sotr:sotrudnik, 
              descrip, 
              action,
              data:date, 
              _who_do:user,
              _who:(payload?._who && payload?._who?._id) || Users.find(el=>el.address === localStorage.getItem(`clientIp`))._id,
              data_dob:dataDob
            };
            if (sotrudnik.length>0 && otdel.length>0 && action.length>0 ) {
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
