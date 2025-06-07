import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState, useEffect, useCallback } from 'react';
import { TextField, Box, FormControl, Autocomplete } from '@mui/material';
import { useSotrudnik, useOtdel, useUsers } from '../../../websocket/WebSocketContext.jsx'
import { useDialogs } from '@toolpad/core/useDialogs';
import CAutoCompleate from '../../utils/CAutoCompleate.jsx';
import getWhoId from '../../users/GetWhoID.jsx';

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

  const handleChangeSotrudnik = useCallback((newValue) => {
    setSotrudnik(newValue ? newValue._id : ''); 
    setOtdel(newValue ? newValue._otdel._id : '') 
  }, []);

  const handleChangeOtdel = useCallback((newValue) => {
    setOtdel(newValue ? newValue._id : '')
  }, []);

  const handleChangeUser = useCallback((newValue) => {
    setUser(newValue ? newValue._id : '')
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
                <CAutoCompleate
                    idComp={`otdel`}
                    label={`Отдел/ПТО*`}
                    memoizedData={Otdel}
                    elementToSelect={otdel}
                    onChangeElement={handleChangeOtdel}
                    flex={0.45}
                    optionLabel='name'
                />
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
                    sx={{flex:`1`}}
                    id="descrip"
                    label="Описание"
                    fullWidth
                    value={descrip}
                    onChange={(event) => setDescrip(event.target.value)}
                />
                <CAutoCompleate
                    idComp={`user`}
                    label={`Кто выполнял*`}
                    memoizedData={Users}
                    elementToSelect={user}
                    onChangeElement={handleChangeUser}
                    optionLabel='name'
                    flex={0.6}
                />
            </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => onClose()}>Отмена</Button>
        <Button
          title="Отправить запрос на сервер"
          disabled={!sotrudnik || !otdel || !action || !date || !user}
          onClick={async () => {
            const res = { 
              _otdel:otdel,
              _sotr:sotrudnik, 
              descrip, 
              action,
              data:date, 
              _who_do:user,
              _who:getWhoId(payload, Users),
              data_dob:dataDob
            };
            if ([sotrudnik, otdel, action, date, user].every(Boolean)) {
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
