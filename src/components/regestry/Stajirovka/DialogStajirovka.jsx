import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState, useEffect, useCallback } from 'react';
import { TextField, Box } from '@mui/material';
import { useSotrudnik, useUsers, useOtdel } from '../../../websocket/WebSocketContext.jsx'
import { useDialogs } from '@toolpad/core/useDialogs';
import getWhoId from '../../users/GetWhoID.jsx';
import CAutoCompleate from '../../utils/CAutoCompleate.jsx';

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

export default function DialogStajirovka({ payload, open, onClose }) {
    const Sotrudnik = useSotrudnik()
    const Users = useUsers()  
    const Otdel = useOtdel()

    const [sotrudnik, setSotrudnik] = useState('');
    const [oldOtdel, setOldOtdel] = useState('');
    const [newOtdel, setNewOtdel] = useState('');
    const [prikaz, setPrikaz] = useState('');
    const [datePrikaz, setDatePrikaz] = useState(dayjs(new Date())); 
    const [dateN, setDateN] = useState(dayjs(new Date())); 
    const [dateK, setDateK] = useState(dayjs(new Date()))
    const [descrip, setDescrip] = useState('');
    const [dataDob, setDataDob] = useState(dayjs(new Date()))

    const dialogs = useDialogs();

    // Заполняем начальные данные при открытии окна
    useEffect(() => {
    if (payload) {        
        setSotrudnik(payload._sotr._id || '');
        setDescrip(payload.descrip || '');
        setPrikaz(payload.prikaz || '');
        setDatePrikaz(dayjs(new Date(payload.data_prikaza)) || dayjs(new Date()));
        setDateN(dayjs(new Date(payload.data_n)) || dayjs(new Date()));
        setDateK(dayjs(new Date(payload.data_k)) || dayjs(new Date()));
        setDataDob(dayjs(new Date(payload.data_dob)) || dayjs(new Date()));
        setOldOtdel(payload._otkyda._id || '');
        setNewOtdel(payload._kyda._id || '');
    }
    }, [payload]);

    const handleChangeSotrudnik = useCallback((newValue) => {
        setSotrudnik(newValue ? newValue._id : '')
        setOldOtdel(newValue ? newValue._otdel._id : ``) 
    }, []);

    const handleChangeOldOtdel = useCallback((newValue) => {
        setOldOtdel(newValue ? newValue._id : '')
    }, []);

    const handleChangeNewOtdel = useCallback((newValue) => {
        setNewOtdel(newValue ? newValue._id : '')
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

            {/* блок элементов даты начала и окончания стажировки */}
            <Box sx={{display:'flex', alignItems:'center', gap:1}}>
                <DatePicker 
                    label="Дата начала*"
                    sx={{width:'100%'}}
                    value={dateN} 
                    onChange={(newValue) => {setDateN(newValue)}} 
                />
                <DatePicker 
                    label="Дата окончания*"
                    sx={{width:'100%'}}
                    value={dateK} 
                    onChange={(newValue) => {setDateK(newValue)}} 
                />
            </Box>

            <Box sx={{display:`flex`, gap:1}}>
                <CAutoCompleate
                    idComp={`old-otdel`}
                    label={`Старый отдел*`}
                    memoizedData={Otdel}
                    elementToSelect={oldOtdel}
                    onChangeElement={handleChangeOldOtdel}
                    optionLabel='name'
                />  
                <CAutoCompleate
                    idComp={`new-otdel`}
                    label={`Новый отдел*`}
                    memoizedData={Otdel}
                    elementToSelect={newOtdel}
                    onChangeElement={handleChangeNewOtdel}
                    optionLabel='name'
                />
            </Box>

            {/* прика3 и его дата */}
            <Box sx={{display:`flex`, gap:1}}>
                <TextField
                    title='Приказ(д/з) о стажировке*'
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
            disabled={!prikaz || !sotrudnik || !newOtdel || !oldOtdel || !dateN || !dateK}
            onClick={async () => {
            const res = { 
                _sotr:sotrudnik, 
                prikaz, 
                data_prikaza:datePrikaz, 
                data_n:dateN, 
                data_k:dateK,
                _otkyda: oldOtdel,
                _kyda: newOtdel,
                descrip, 
                _who:getWhoId(payload,Users),
                data_dob:dataDob
            };
            if ([prikaz, sotrudnik, newOtdel, oldOtdel, dateN, dateK].every(Boolean)) {
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
