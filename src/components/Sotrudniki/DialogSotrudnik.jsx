import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useState, useEffect } from 'react';
import { TextField, Box, FormControl, Autocomplete } from '@mui/material';
import { useDoljnost, useOtdel } from '../../websocket/WebSocketContext.jsx'
import { useDialogs } from '@toolpad/core/useDialogs';


export default function DialogAddSotrudnik({ payload, open, onClose }) {
  const Doljnost = useDoljnost()
  const Otdel = useOtdel()
  const [disabled, setDisabled] = useState(false);
  const [descrip, setDescrip] = useState('');
  const [phone, setPhone] = useState('');
  const [fio, setFio] = useState('');
  const [login, setLogin] = useState('');
  const [doljnost, setDoljnost] = useState('');
  const [otdel, setOtdel] = useState('');
  const [lnp, setLnp] = useState(0);
  const [textFieldError, setTextFieldError] = useState(false);
  const dialogs = useDialogs();

  // Обработчик изменения ФИО
  function handleNameChange(event) {
    if (event.target.value.length < 3) {
      setTextFieldError(true);
      setDisabled(true);
      setFio(event.target.value);
    } else {
      setFio(event.target.value);
      setDisabled(false);
      setTextFieldError(false);
    }
  }
  // Заполняем начальные данные при открытии окна
  useEffect(() => {
    if (payload) {        
      setFio(payload.fio || '');
      setDescrip(payload.descrip || '');
      setLogin(payload.login || '');
      setPhone(payload.phone || '');
      setDoljnost(payload._doljnost._id || '');
      setOtdel(payload._otdel._id || '');
      setLnp(payload.lnp || '');
    }
  }, [payload]);

  return (
    <Dialog fullWidth open={open} onClose={() => onClose()}>
      <DialogTitle>Редактирование данных:</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: `20px`, padding:`20px 0` }}>
          <Box sx={{ display: 'flex', gap: `20px` }}>
              {/* Поле для ввода ФИО */}
              <TextField
              id="name"
              error={textFieldError}
              helperText={textFieldError ? 'Больше 2-х символов.' : null}
              label="ФИО"
              fullWidth
              value={fio}
              onChange={handleNameChange}
            />

            {/* Поле для ввода описания */}
            <TextField
              id="lnp"
              label="ЛНП"
              value={lnp}
              onChange={(event) => setLnp(event.target.value)}
            />
          </Box>

          {/* Выпадающий список для выбора должности */}
          <FormControl fullWidth>
            <Autocomplete
              id="doljnost"
              value={Doljnost.find(o => o._id === doljnost) || null}
              onChange={(event, newValue) => setDoljnost(newValue ? newValue._id : '')}
              options={Doljnost}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option._id === value?._id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Должность*"
                  variant="outlined"
                />
              )}
            />
          </FormControl>
          {/* Выпадающий список для выбора отдела */}
          <FormControl fullWidth>
            <Autocomplete
              id="otdel"
              value={Otdel.find(o => o._id === otdel) || null}
              onChange={(event, newValue) => setOtdel(newValue ? newValue._id : '')}
              options={Otdel}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option._id === value?._id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Отдел*"
                  variant="outlined"
                />
              )}
            />
          </FormControl>
            {/* Поле для ввода телефона */}
            <TextField
            id="phone"
            label="Телефон"
            fullWidth
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />

          {/* Поле для ввода логина */}
          <TextField
            id="dns"
            label="Логин AD*"
            fullWidth
            value={login}
            onChange={(event) => setLogin(event.target.value)}
          />

          <Box sx={{display:`flex`, gap:`20px`, marginTop:`20px`}}>
            {/* Поле для ввода описания */}
            <TextField
              id="descrip"
              label="Описание"
              fullWidth
              value={descrip}
              onChange={(event) => setDescrip(event.target.value)}
            />
          </Box>

        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Отмена</Button>
        <Button
          title="Отправить запрос на сервер"
          disabled={disabled}
          onClick={() => {
            if (login.length < 3) {
              dialogs.alert('Необходимо указать логин AD')
              return;
            }
            const res = { fio, descrip, _doljnost: doljnost, _otdel: otdel, phone: phone, login:login,lnp:lnp};
            onClose(fio.length > 2 ? res : null);
          }}
        >
          Отправить
        </Button>
      </DialogActions>
    </Dialog>
  );
}
