import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useEffect, useReducer, useCallback } from 'react';
import { TextField, Box, FormControl, Autocomplete } from '@mui/material';
import { useSotrudnik, useUsers, useOtdel } from '../../../websocket/WebSocketContext.jsx'
import { useDialogs } from '@toolpad/core/useDialogs';
import getWhoId from '../../users/GetWhoID.jsx';
import CAutoCompleate from '../../utils/CAutoCompleate.jsx';
import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

export default function DialogVPerevod({ payload, open, onClose }) {
  const Sotrudnik = useSotrudnik()
  const Users = useUsers()  
  const Otdel = useOtdel()
  const dialogs = useDialogs();

  const initialState = {
    sotrudnik: '',
    oldOtdel: '',
    newOtdel: '',
    prikaz: '',
    datePrikaz: dayjs(new Date()),
    dateN: dayjs(new Date()),
    dateK: dayjs(new Date()),
    dataDob: dayjs(new Date()),
    type: '',
    descrip: ''
  };

  function reducer(state, action) {
    switch (action.type) {
        case 'SET_FIELD':
            return { ...state, [action.field]: action.value };
        case 'INIT_FROM_PAYLOAD':
            const p = action.payload || {};
            return {
                sotrudnik: p._sotr?._id || '',
                oldOtdel: p._otkyda?._id || '',
                newOtdel: p._kyda?._id || '',
                prikaz: p.prikaz || '',
                datePrikaz: dayjs(new Date(p.data_prikaza)) || dayjs(new Date()),
                dateN: dayjs(new Date(p.data_n)) || dayjs(new Date()),
                dateK: dayjs(new Date(p.data_k)) || dayjs(new Date()),
                dataDob: dayjs(new Date(p.data_dob)) || dayjs(new Date()),
                type: p.type || '',
                descrip: p.descrip || ''
            };
        case 'RESET':
            return initialState;
        default:
            return state;
    }
  }
  const [state, dispatch] = useReducer(reducer, initialState);
  // Заполняем начальные данные при открытии окна
  useEffect(() => {
    if (payload) {  
        dispatch({type:'INIT_FROM_PAYLOAD', payload})      
    } 
  }, [payload]);

  const handleChangeSotrudnik = useCallback((newValue) => {
    dispatch({type:'SET_FIELD', field:'sotrudnik', value:newValue ? newValue._id : ''})
    dispatch({type:'SET_FIELD', field:'oldOtdel', value:newValue ? newValue._otdel._id : ``})
  }, []);

  const handleChangeOldOtdel = useCallback((newValue) => {
    dispatch({type:'SET_FIELD', field:'oldOtdel', value:newValue ? newValue._id : ''})
  }, []);
  
  const handleChangeNewOtdel = useCallback((newValue) => {
    dispatch({type:'SET_FIELD', field:'newOtdel', value:newValue ? newValue._id : ''})
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
                    elementToSelect={state.sotrudnik}
                    onChangeElement={handleChangeSotrudnik}
                />
            </Box>

            <Box sx={{display:`flex`, gap:1}}>
                <CAutoCompleate
                    idComp={`old-otdel`}
                    label={`Старый отдел*`}
                    memoizedData={Otdel}
                    elementToSelect={state.oldOtdel}
                    onChangeElement={handleChangeOldOtdel}
                    optionLabel='name'
                />
                <CAutoCompleate
                    idComp={`new-otdel`}
                    label={`Новый отдел*`}
                    memoizedData={Otdel}
                    elementToSelect={state.newOtdel}
                    onChangeElement={handleChangeNewOtdel}
                    optionLabel='name'
                />
            </Box>

            <Box sx={{display:`flex`, gap:1, justifyContent:'space-between'}}>
                <DatePicker 
                    label="Дата С*"
                    value={state.dateN} 
                    onChange={(newValue) => {dispatch({type:'SET_FIELD', field:'dateN', value:newValue})}} 
                />
                <hr />
                <DatePicker 
                    label="Дата ПО*"
                    value={state.dateK} 
                    onChange={(newValue) => {dispatch({type:'SET_FIELD', field:'dateK', value:newValue})}} 
                />
            </Box>
            <FormControl sx={{flex:`1`}}>
                <Autocomplete
                    value={state.type}
                    onChange={(event, newValue) => {
                        dispatch({type:'SET_FIELD', field:'type', value:newValue})
                    }}
                    id="selet-type-vperevod"
                    options={[`Командировка`,`Временное перемещение`]}
                    renderInput={(params) => <TextField {...params} label="Тип" />}
                />
            </FormControl>
            {/* прика3 и его дата */}
            <Box sx={{display:`flex`, gap:1}}>
                <TextField
                    title='Приказ(д/з) о переводе*'
                    id="prikaz"
                    label="Приказ*"
                    fullWidth
                    value={state.prikaz}
                    onChange={(event) => dispatch({type:'SET_FIELD', field:'prikaz', value:event.target.value})}
                />
                <DatePicker 
                    label="Дата приказа*"
                    value={state.datePrikaz} 
                    onChange={(newValue) => {dispatch({type:'SET_FIELD', field:'datePrikaz', value:newValue})}} 
                />
            </Box>

            <TextField
                id="descrip"
                label="Описание"
                fullWidth
                value={state.descrip}
                onChange={(event) => dispatch({type:'SET_FIELD', field:'descrip', value:event.target.value})}
            />

        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => onClose()}>Отмена</Button>
        <Button
          title="Отправить запрос на сервер"
          disabled={!state.prikaz || !state.sotrudnik || !state.newOtdel || !state.oldOtdel || !state.dateN || !state.dateK || !state.datePrikaz}
          onClick={async () => {
            const res = { 
              _sotr:state.sotrudnik, 
              prikaz:state.prikaz, 
              data_prikaza:state.datePrikaz, 
              data_n:state.dateN, 
              data_k:state.dateK, 
              _otkyda: state.oldOtdel,
              _kyda: state.newOtdel,
              type:state.type,
              descrip:state.descrip, 
              _who:getWhoId(payload,Users),
              data_dob:state.dataDob
            };
            if ([state.prikaz, state.sotrudnik, state.newOtdel, state.oldOtdel, state.dateN, state.dateK, state.datePrikaz].every(Boolean)) {
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
