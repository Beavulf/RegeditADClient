import { useReducer, useEffect, useCallback } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useSotrudnik, useUsers } from '../../../../websocket/WebSocketContext.jsx'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useDialogs } from '@toolpad/core/useDialogs';
import Divider from '@mui/material/Divider';
import getWhoId from '../../../users/GetWhoID.jsx';
import PravoItem from './DialogElementPrava.jsx';
import CAutoCompleate from '../../../utils/CAutoCompleate.jsx';

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

export default function DialogZaprosSPrava({ payload, open, onClose }) {
    const Sotrudnik = useSotrudnik()
    const Users = useUsers()     
    const dialogs = useDialogs();

    const initialState = {
        _sotr: '',
        prikaz: '',
        data_prikaza: dayjs(),
        data_dob: dayjs(),
        prava: Array.from({ length: 19 }, (_, i) => ({
            id: i + 1,
            status: 0,
            note: '',
        })),
        descrip: '',
    }
    
    function reducer (state, action) {
        switch (action.type) {
            case 'SET_FIELD':
                return { ...state, [action.field]: action.value };
            case 'SET_PRAVA_FIELD':
                const { index, key, value } = action;
                return {
                    ...state,
                    prava: state.prava.map((item, i) =>
                        i === index ? { ...item, [key]: value } : item
                    ),
                };
            case 'INIT_FROM_PAYLOAD':
                const p = action.payload || {};
                return {
                    _sotr: p._sotr?._id || '',
                    prikaz: p.prikaz || '',
                    data_prikaza: dayjs(p.data_prikaza) || dayjs(),
                    data_dob: dayjs(p.data_dob) || dayjs(),
                    prava: p.prava || Array.from({ length: 19 }, (_, i) => ({
                        id: i + 1,
                        status: 0,
                        note: '',
                    })),
                    descrip: p.descrip || '',
                }
            case 'RESET':
                return initialState;
            default:
                return state;
        }
    }

    const [state, dispatch] = useReducer(reducer, initialState);

    // Заполняем начальные данные при открытии окна
    useEffect(() => {
        dispatch({ type: 'INIT_FROM_PAYLOAD', payload });
    }, [payload]);

    // для передачи функции в компонент
    const handleChangeStatus = useCallback((index, value) => 
        dispatch({type: 'SET_PRAVA_FIELD', index, key: 'status', value}
    ),[]);
    // для передачи функции в компонент
    const handleChangeNote = useCallback((index, value) => 
        dispatch({type: 'SET_PRAVA_FIELD', index, key: 'note', value}
    ),[]);

    const handleChangeSotrudnik = useCallback((newValue) => {
        dispatch({type: 'SET_FIELD', field: '_sotr', value: newValue ? newValue._id : ''})
    }, []);

    return (
        <Dialog fullWidth={true} maxWidth='100px' open={open} onClose={() => onClose()}>
        <DialogTitle>Выдача прав</DialogTitle>
            <DialogContent>
                <Box sx={{ p: 2, gap:1, display:'flex', flexDirection:'columnn'}}>
                <Typography variant="h6" gutterBottom>Кому:</Typography>

                <Box sx={{display:'flex', gap:1, flexDirection:'column',p:1,}}>
                    <CAutoCompleate
                        flex={1}
                        idComp={`sotrudnik`}
                        label={`Сотрудник*`}
                        memoizedData={Sotrudnik}
                        elementToSelect={state._sotr}
                        onChangeElement={handleChangeSotrudnik}
                    />

                    <Box sx={{display:'flex', alignItems:'center', gap:1}}>
                        <TextField
                            fullWidth
                            label="Приказ*"
                            value={state.prikaz}
                            onChange={e => dispatch({type: 'SET_FIELD', field: 'prikaz', value: e.target.value})}
                        />
                        <DatePicker 
                            label="Дата приказа*"
                            value={state.data_prikaza} 
                            onChange={newValue => dispatch({type: 'SET_FIELD', field: 'data_prikaza', value: dayjs(newValue)})} 
                        />
                    </Box>
                    <TextField
                        fullWidth
                        label="Описание"
                        multiline
                        rows={2}
                        value={state.descrip}
                        onChange={e => dispatch({type: 'SET_FIELD', field: 'descrip', value: e.target.value})}
                    />
                </Box>
                <Divider orientation="vertical" flexItem/>

                <Typography variant="h6">Права:</Typography>
                <Box sx={{ columnCount: 3, columnGap: 1 }}>
                    {state.prava.map((p, index) => (
                        <PravoItem 
                        key={index} 
                        p={p} 
                        index={index}
                        onChangeStatus={handleChangeStatus} 
                        onChangeNote={handleChangeNote} />
                    ))}
                </Box>
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={() => onClose()}>Отмена</Button>
                <Button
                    title="Отправить запрос на сервер"
                    disabled={!state.prikaz || !state._sotr || !state.data_prikaza}
                    onClick={async () => {
                        if ([state.prikaz, state._sotr, state.data_prikaza].every(Boolean)) {
                            onClose({...state, _who:getWhoId(payload,Users)});
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
