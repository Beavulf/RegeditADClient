import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState, useEffect, useCallback } from 'react';
import { TextField, Box } from '@mui/material';
import { useSotrudnik, useUsers } from '../../../websocket/WebSocketContext.jsx'
import { useDialogs } from '@toolpad/core/useDialogs';
import getWhoId from '../../users/GetWhoID.jsx';
import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');
import CAutoCompleate from '../../utils/CAutoCompleate.jsx';

export default function DialogFamilia({ payload, open, onClose }) {
  const Sotrudnik = useSotrudnik()
  const Users = useUsers()  

  const [sotrudnik, setSotrudnik] = useState('');
  const [prikaz, setPrikaz] = useState('');
  const [datePrikaz, setDatePrikaz] = useState(dayjs(new Date())); 
  const [oldFam, setOldFam] = useState('');
  const [newFam, setNewFam] = useState('');
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
        setDataDob(dayjs(new Date(payload.data_dob)) || dayjs(new Date()));
        setOldFam(payload.pred_znach || '');
        setNewFam(payload.new_znach || '');
    }
  }, [payload]);

  const handleChangeSotrudnik = useCallback((newValue) => {
    setSotrudnik(newValue ? newValue._id : '')
    setOldFam(newValue ? newValue.fio.split(' ')[0]: ``) 
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

            <Box sx={{display:`flex`, gap:1}}>
                <TextField
                    title='Старая фамилия'
                    id="oldFam"
                    label="Старая фамилия"
                    fullWidth
                    value={oldFam}
                    onChange={(event) => setOldFam(event.target.value)}
                />
                <TextField
                    title='Новая фамилия*'
                    id="newFam"
                    label="Новая фамилия*"
                    fullWidth
                    value={newFam}
                    onChange={(event) => setNewFam(event.target.value)}
                />
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
          disabled={!sotrudnik || !prikaz || !newFam}
          onClick={async () => {
            const res = { 
              _sotr:sotrudnik, 
              prikaz, 
              data_prikaza:datePrikaz,
              pred_znach:oldFam, 
              new_znach:newFam,
              descrip, 
              _who:getWhoId(payload,Users),
              data_dob:dataDob
            };
            if ([prikaz, sotrudnik, newFam].every(Boolean)) {
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
