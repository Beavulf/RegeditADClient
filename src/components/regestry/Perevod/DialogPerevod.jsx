import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState, useEffect } from 'react';
import { TextField, Box, FormControl, Autocomplete } from '@mui/material';
import { useSotrudnik, useUsers, useOtdel } from '../../../websocket/WebSocketContext.jsx'
import { useDialogs } from '@toolpad/core/useDialogs';

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

export default function DialogPerevod({ payload, open, onClose }) {
  const Sotrudnik = useSotrudnik()
  const Users = useUsers()  
  const Otdel = useOtdel()

  const [sotrudnik, setSotrudnik] = useState('');
  const [oldOtdel, setOldOtdel] = useState('');
  const [newOtdel, setNewOtdel] = useState('');
  const [prikaz, setPrikaz] = useState('');
  const [datePrikaz, setDatePrikaz] = useState(dayjs(new Date())); 
  const [datePer, setDatePer] = useState(dayjs(new Date())); 
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
        setDatePer(dayjs(new Date(payload.data_per)) || dayjs(new Date()));
        setDataDob(dayjs(new Date(payload.data_dob)) || dayjs(new Date()));
        setOldOtdel(payload._otkyda._id || '');
        setNewOtdel(payload._kyda._id || '');
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
                            setOldOtdel(newValue ? newValue._otdel._id : ``) 
                        }}
                        onInputChange={(event, value) => {
                            // Фильтруем варианты по введенному значению
                            const filteredOptions = Sotrudnik.filter(option => option.fio.toLowerCase().includes(value.toLowerCase()));
                            // Если после фильтрации остался только один вариант, автоматически выбираем его
                            if (filteredOptions.length === 1) {
                                setSotrudnik(filteredOptions[0]._id);
                                setOldOtdel(filteredOptions[0] ? filteredOptions[0]._otdel._id : ``)
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
                    label="Дата перевода*"
                    value={datePer} 
                    onChange={(newValue) => {setDatePer(newValue)}} 
                />
            </Box>

            <Box sx={{display:`flex`, gap:1}}>
                <FormControl sx={{flex:`1`}}>
                    <Autocomplete
                        id="old-otdel"
                        fullWidth
                        value={Otdel.find(o => o._id === oldOtdel) || null}
                        onChange={(event, newValue) => {
                            setOldOtdel(newValue ? newValue._id : '');
                        }}
                        onInputChange={(event, value) => {
                            const filteredOptions = Otdel.filter(option => option.name.toLowerCase().includes(value.toLowerCase()));
                            if (filteredOptions.length === 1) {
                                setOldOtdel(filteredOptions[0]._id);
                                event?.target?.blur();
                            }
                        }}
                        options={Otdel}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) => option._id === value?._id}
                        title='Выбор отдела'
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Старый отдел"
                                variant="outlined"
                            />
                        )}
                    />
                </FormControl>
                <FormControl sx={{flex:`1`}}>
                    <Autocomplete
                        id="new-otdel"
                        fullWidth
                        value={Otdel.find(o => o._id === newOtdel) || null}
                        onChange={(event, newValue) => {
                            setNewOtdel(newValue ? newValue._id : '');
                        }}
                        onInputChange={(event, value) => {
                            const filteredOptions = Otdel.filter(option => option.name.toLowerCase().includes(value.toLowerCase()));
                            if (filteredOptions.length === 1) {
                                setNewOtdel(filteredOptions[0]._id);
                                event?.target?.blur();
                            }
                        }}
                        options={Otdel}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) => option._id === value?._id}
                        title='Выбор отдела'
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Новый отдел*"
                                variant="outlined"
                            />
                        )}
                    />
                </FormControl>
            </Box>

            {/* прика3 и его дата */}
            <Box sx={{display:`flex`, gap:1}}>
                <TextField
                    title='Приказ(д/з) переводе*'
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
              data_per:datePer, 
              _otkyda: oldOtdel,
              _kyda: newOtdel,
              descrip, 
              _who:(payload?._who && payload?._who?._id) || Users.find(el=>el.address === localStorage.getItem(`clientIp`))._id,
              data_dob:dataDob
            };
            if ([prikaz, sotrudnik, newOtdel].every(value => value.length > 0) && datePer!=null) {
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
