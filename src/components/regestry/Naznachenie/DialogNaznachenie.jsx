import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState, useEffect, useCallback } from 'react';
import { TextField, Box, FormControl, Autocomplete } from '@mui/material';
import { useSotrudnik, useUsers, useDoljnost } from '../../../websocket/WebSocketContext.jsx'
import { useDialogs } from '@toolpad/core/useDialogs';
import getWhoId from '../../users/GetWhoID.jsx';
import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');
import CAutoCompleate from '../../utils/CAutoCompleate.jsx';


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

  const handleChangeSotrudnik = useCallback((newValue) => {
    setSotrudnik(newValue ? newValue._id : '')
    setOldDoljnost(newValue ? newValue._doljnost._id : ``) 
  }, []);

  const handleChangeOldDoljnost = useCallback((newValue) => {
    setOldDoljnost(newValue ? newValue._id : '')
  }, []);
  
  const handleChangeNewDoljnost = useCallback((newValue) => {
    setNewDoljnost(newValue ? newValue._id : '')
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
                <DatePicker 
                    label="Дата назначения*"
                    value={dateNaznach} 
                    onChange={(newValue) => {setDateNaznach(newValue)}} 
                />
            </Box>

            <Box sx={{display:`flex`, gap:1}}>
                <CAutoCompleate
                    idComp={`old-doljnost`}
                    label={`Старая должность*`}
                    memoizedData={Doljnost}
                    elementToSelect={oldDoljnost}
                    onChangeElement={handleChangeOldDoljnost}
                    optionLabel='name'
                />
                <CAutoCompleate
                    idComp={`new-doljnost`}
                    label={`Новая должность*`}
                    memoizedData={Doljnost}
                    elementToSelect={newDoljnost}
                    onChangeElement={handleChangeNewDoljnost}
                    optionLabel='name'
                />
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
          disabled={!sotrudnik || !newDoljnost || !dateNaznach || !oldDoljnost}
          onClick={async () => {
            const res = { 
              _sotr:sotrudnik, 
              prikaz, 
              data_prikaza:datePrikaz, 
              data_nazn:dateNaznach, 
              _pred_znach:oldDoljnost,
              _new_znach: newDoljnost,
              descrip, 
              _who:getWhoId(payload,Users),
              data_dob:dataDob
            };
            if ([prikaz, sotrudnik, newDoljnost].every(Boolean) && dateNaznach!=null) {
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
