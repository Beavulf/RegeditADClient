import { useState } from 'react';
import {
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
  Box,
  Autocomplete,
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useSotrudnik, useUsers } from '../../../websocket/WebSocketContext.jsx'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useDialogs } from '@toolpad/core/useDialogs';
import Divider from '@mui/material/Divider';

const statuses = [
  { value: 0, label: 'Не выдано' },
  { value: 1, label: 'Выдано' },
  { value: 2, label: 'Спец' },
];

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

export default function DialogZaprosSPrava({ payload, open, onClose }) {
    const Sotrudnik = useSotrudnik()
    const Users = useUsers()     
    const dialogs = useDialogs();

    // state для хранения всей информации
    const [form, setForm] = useState({
        _sotr: payload && payload._sotr._id || '',
        prikaz: payload && payload.prikaz || '',
        data_prikaza: payload && dayjs(payload.data_prikaza) || dayjs(),
        data_dob: payload && dayjs(payload.data_dob) || dayjs(),
        prava: payload && payload.prava || Array.from({ length: 19 }, (_, i) => ({
            id: i + 1,
            status: 0,
            note: '',
        })),
        _who:(payload?._who && payload?._who?._id) || Users.find(el=>el.address === localStorage.getItem(`clientIp`))._id,
        descrip: payload && payload.descrip || '',
    });

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handlePravaChange = (index, key, value) => {
        const updated = [...form.prava];
        updated[index][key] = value;
        setForm(prev => ({ ...prev, prava: updated }));
    };

    return (
        <Dialog fullWidth={true} maxWidth='100px' open={open} onClose={() => onClose()}>
        <DialogTitle>Выдача прав</DialogTitle>
            <DialogContent>
                <Box sx={{ p: 2, gap:1, display:'flex', flexDirection:'columnn'}}>
                <Typography variant="h6" gutterBottom>Кому:</Typography>

                <Box sx={{display:'flex', gap:1, flexDirection:'column',p:1,}}>
                    <FormControl fullWidth={true}> 
                        <Autocomplete
                            id="sotrudnik"
                            value={Sotrudnik.find(o => o._id === form._sotr) || null}
                            onChange={(event, newValue) => {
                                handleChange('_sotr', newValue ? newValue._id : '')
                            }}
                            onInputChange={(event, value) => {
                                // Фильтруем варианты по введенному значению
                                const filteredOptions = Sotrudnik.filter(option => option.fio.toLowerCase().includes(value.toLowerCase()));
                                // Если после фильтрации остался только один вариант, автоматически выбираем его
                                if (filteredOptions.length === 1) {
                                    handleChange('_sotr', filteredOptions[0]._id)
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

                    <Box sx={{display:'flex', alignItems:'center', gap:1}}>
                        <TextField
                            fullWidth
                            label="Приказ*"
                            value={form.prikaz}
                            onChange={e => handleChange('prikaz', e.target.value)}
                        />
                        <DatePicker 
                            label="Дата приказа*"
                            value={form.data_prikaza} 
                            onChange={newValue => handleChange('data_prikaza', dayjs(newValue))} 
                        />
                    </Box>

                    <TextField
                        fullWidth
                        label="Описание"
                        multiline
                        rows={2}
                        value={form.descrip}
                        onChange={e => handleChange('descrip', e.target.value)}
                    />
                </Box>
                <Divider orientation="vertical" flexItem/>

                <Typography variant="h6">Права:</Typography>
                <Box sx={{ columnCount: 3, columnGap: 1 }}>
                    {form.prava.map((p, index) => (
                        <Box key={index} sx={{ p:1, display: 'flex', gap: 1,}}>
                            <Typography variant="subtitle2" sx={{width:'40px'}}>#{p.id}</Typography>

                            <FormControl fullWidth>
                                <InputLabel>Статус</InputLabel>
                                <Select
                                    sx={{bgcolor:p.status === 0 ? '#f582827e' : p.status === 1 ? '#7fe3907e' : '#e3cd7f7e'}}
                                    size='small'
                                    value={p.status}
                                    label="Статус"
                                    onChange={(e) => handlePravaChange(index, 'status', e.target.value)}
                                    >
                                    {statuses.map((s) => (
                                        <MenuItem key={s.value} value={s.value} sx={{bgcolor:s.label === 'Не выдано' ? '#f582827e' : s.label === 'Выдано' ? '#7fe3907e' : '#e3cd7f7e'}}>
                                        {s.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                size='small'
                                label="Примечание"
                                value={p.note}
                                onChange={(e) => handlePravaChange(index, 'note', e.target.value)}
                            />
                        </Box>
                    ))}
                </Box>
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={() => onClose()}>Отмена</Button>
                <Button
                    title="Отправить запрос на сервер"
                    onClick={async () => {
                    if ([form.prikaz, form._sotr].every(value => value.length > 0) && form.data_prikaza!=null) {
                        onClose(form);
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
