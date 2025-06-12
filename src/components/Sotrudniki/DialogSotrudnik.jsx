import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useState, useEffect } from 'react';
import { TextField, Box } from '@mui/material';
import { useDoljnost, useOtdel } from '../../websocket/WebSocketContext.jsx'
import { useDialogs } from '@toolpad/core/useDialogs';
import CAutoCompleate from '../utils/CAutoCompleate.jsx';

export default function DialogAddSotrudnik({ payload, open, onClose }) {
  const Doljnost = useDoljnost()
  const Otdel = useOtdel()
  const dialogs = useDialogs();

  const [disabled, setDisabled] = useState(false);
  const [descrip, setDescrip] = useState('');
  const [phone, setPhone] = useState('');
  const [fio, setFio] = useState('');
  const [login, setLogin] = useState('');
  const [doljnost, setDoljnost] = useState('');
  const [otdel, setOtdel] = useState('');
  const [lnp, setLnp] = useState(0);
  const [textFieldError, setTextFieldError] = useState(false);

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

  const handleChangeDoljnost = (newValue) => {
    setDoljnost(newValue ? newValue._id : '')
  };

  const handleChangeOtdel = (newValue) => {
    setOtdel(newValue ? newValue._id : '')
  };

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
          <CAutoCompleate
              idComp='doljnost'
              label='Должность*'
              memoizedData={Doljnost}
              elementToSelect={doljnost}
              onChangeElement={handleChangeDoljnost}
              optionLabel='name'
          />
          {/* Выпадающий список для выбора отдела */}
          <CAutoCompleate
              idComp='otdel'
              label='Отдел*'
              memoizedData={Otdel}
              elementToSelect={otdel}
              onChangeElement={handleChangeOtdel}
              optionLabel='name'
          />
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
            const res = { fio, descrip, _doljnost: doljnost, _otdel: otdel, phone: phone, login:login, lnp:lnp };
            if ([fio, doljnost, otdel, login].some(el=>el.length < 2)) {
              dialogs.alert('Корректно заполните все поля.')
              return;
            } else {
              onClose(fio.length > 2 ? res : null);
            }
          }}
        >
          Отправить
        </Button>
      </DialogActions>
    </Dialog>
  );
}
