import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState, useEffect } from 'react';
import { TextField, Box, FormControl, Autocomplete } from '@mui/material';
import { useSotrudnik, useUsers, useDoljnost } from '../../../websocket/WebSocketContext.jsx'
import { useDialogs } from '@toolpad/core/useDialogs';

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

export default function DialogNaznachenie({ payload, open, onClose }) {
  const Sotrudnik = useSotrudnik()
  const Users = useUsers()  
  const Doljnost = useDoljnost()

  const [sotrudnik, setSotrudnik] = useState('');
  const [oldDoljnost, setOldDoljnost] = useState('');
  const [newDoljnost, setNewDoljnost] = useState('');
  const [prikaz, setPrikaz] = useState('');
  const [datePrikaz, setDatePrikaz] = useState(dayjs(new Date())); 
  const [dateNaznach, setDateNaznach] = useState(dayjs(new Date())); 
  const [dataDob, setDataDob] = useState(dayjs(new Date()))
  const [descrip, setDescrip] = useState('');

  const dialogs = useDialogs();

  // Заполняем начальные данные при открытии окна
  useEffect(() => {
    if (payload) {        
        setSotrudnik(payload._sotr._id || '');
        setDescrip(payload.descrip || '');
        setPrikaz(payload.prikaz || '');
        setDatePrikaz(dayjs(new Date(payload.data_prikaza)) || dayjs(new Date()));
        setDateNaznach(dayjs(new Date(payload.data_nazn)) || dayjs(new Date()));
        setDataDob(dayjs(new Date(payload.data_dob)) || dayjs(new Date()));
        setOldDoljnost(payload._pred_znach._id || '');
        setNewDoljnost(payload._new_znach._id || '');
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
                            setOldDoljnost(newValue ? newValue._doljnost._id : ``) 
                        }}
                        onInputChange={(event, value) => {
                            // Фильтруем варианты по введенному значению
                            const filteredOptions = Sotrudnik.filter(option => option.fio.toLowerCase().includes(value.toLowerCase()));
                            // Если после фильтрации остался только один вариант, автоматически выбираем его
                            if (filteredOptions.length === 1) {
                                setSotrudnik(filteredOptions[0]._id);
                                setOldDoljnost(filteredOptions[0] ? filteredOptions[0]._doljnost._id : ``)
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

                <DatePicker 
                    label="Дата назначения*"
                    value={dateNaznach} 
                    onChange={(newValue) => {setDateNaznach(newValue)}} 
                />
            </Box>

            <Box sx={{display:`flex`, gap:1}}>
                <FormControl sx={{flex:`1`}}>
                    <Autocomplete
                        id="old-doljnost"
                        fullWidth
                        value={Doljnost.find(o => o._id === oldDoljnost) || null}
                        onChange={(event, newValue) => {
                            setOldDoljnost(newValue ? newValue._id : '');
                        }}
                        onInputChange={(event, value) => {
                            const filteredOptions = Doljnost.filter(option => option.name.toLowerCase().includes(value.toLowerCase()));
                            if (filteredOptions.length === 1) {
                                setOldDoljnost(filteredOptions[0]._id);
                                event?.target?.blur();
                            }
                        }}
                        options={Doljnost}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) => option._id === value?._id}
                        title='Выбор должности'
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Старая должность"
                                variant="outlined"
                            />
                        )}
                    />
                </FormControl>
                <FormControl sx={{flex:`1`}}>
                    <Autocomplete
                        id="new-doljnost"
                        fullWidth
                        value={Doljnost.find(o => o._id === newDoljnost) || null}
                        onChange={(event, newValue) => {
                            setNewDoljnost(newValue ? newValue._id : '');
                        }}
                        onInputChange={(event, value) => {
                            const filteredOptions = Doljnost.filter(option => option.name.toLowerCase().includes(value.toLowerCase()));
                            if (filteredOptions.length === 1) {
                                setNewDoljnost(filteredOptions[0]._id);
                                event?.target?.blur();
                            }
                        }}
                        options={Doljnost}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) => option._id === value?._id}
                        title='Выбор должности'
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Новая должность*"
                                variant="outlined"
                            />
                        )}
                    />
                </FormControl>
            </Box>

            {/* прика3 и его дата */}
            <Box sx={{display:`flex`, gap:1}}>
                <TextField
                    title='Приказ о приеме на работу*'
                    id="prikaz"
                    label="Приказ*"
                    fullWidth
                    value={prikaz}
                    onChange={(event) => setPrikaz(event.target.value)}
                />
                <DatePicker 
                    label="Дата приказа*"
                    value={datePrikaz} 
                    onChange={(newValue) => {setDatePrikaz(newValue)}} 
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
              _sotr:sotrudnik, 
              prikaz, 
              data_prikaza:datePrikaz, 
              data_nazn:dateNaznach, 
              _pred_znach:oldDoljnost,
              _new_znach: newDoljnost,
              descrip, 
              _who:(payload?._who && payload?._who?._id) || Users.find(el=>el.address === localStorage.getItem(`clientIp`))._id,
              data_dob:dataDob
            };
            if ([prikaz, sotrudnik, newDoljnost].every(value => value.length > 0) && dateNaznach!=null) {
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
