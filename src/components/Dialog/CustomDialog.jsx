import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useState, useEffect } from 'react';
import {TextField, Box, MenuItem, Select, FormControl, InputLabel} from '@mui/material'
import { useWebSocketContext } from '../../websocket/WebSocketContext.jsx'

export function DialogEditUsers({payload, open, onClose}) {
  const [role, setRole] = useState(`manager`)
  const [name,setName] = useState(``)
  const [nameError, setNameError] = useState(false)
  const {sendJsonMessage} = useWebSocketContext()

  function handleNameChange(event) {
    if (event.target.value.length < 3) {
        setNameError(true)
        setName(event.target.value);
    } else {
        setName(event.target.value);
        setNameError(false)
    }
  }
  useEffect(()=>{
    if (payload){
      setName(payload.name)
      setRole(payload.role)
    }
  },[payload])

  return (
    <Dialog fullWidth open={open} onClose={() => onClose()}>
      <DialogTitle>Редактирование данных:</DialogTitle>
      <DialogContent>
        <Box sx={{display:`flex`, padding:`10px`}}>
            <TextField
                error={nameError}
                helperText={nameError ? `Больше 2-х символов.` : null}
                label="Name"
                fullWidth
                value={name}
                onChange={handleNameChange}
            />
          <FormControl fullWidth sx={{m:`0 0 0 5px`}}>
            <InputLabel>Роль</InputLabel>
            <Select
              id="demo-simple-select"
              value={role}
              label="Age" 
              onChange={(event)=>setRole(event.target.value)}  
            >
              <MenuItem value={`admin`}>Admin</MenuItem>
              <MenuItem value={`manager`}>Manager</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
      <Button onClick={() => {onClose()}}>Отмена</Button>
        <Button 
          title='Отправить на сервер запрос.'
          onClick={async () => {       
            const res = {name:name, role:role}
            await sendJsonMessage({
              type: 'quitClientConnect',
              data: {tragetIp:payload.address}
            })
            onClose(name.length>2 ? res: null)
          }}>Отправить</Button>
      </DialogActions>
    </Dialog>
  );
}

export function DialogEditOtdelOrDoljnost({payload, open, onClose}) {
  const [descrip, setDescrip] = useState(`-`)
  const [name,setName] = useState(``)
  const [textFieldError, setTextFieldError] = useState(false)

  function handleNameChange(event) {
    if (event.target.value.length < 3) {
      setTextFieldError(true)
      setName(event.target.value)
    } else {
      setName(event.target.value)
      setTextFieldError(false)
    }
  }
  useEffect(()=>{
    if (payload){
      setName(payload.name)
      setDescrip(payload.descrip)
    }
  },[payload])

  return (
    <Dialog fullWidth open={open} onClose={() => onClose()}>
      <DialogTitle>Редактирование данных:</DialogTitle>
      <DialogContent>
        <Box sx={{display:`flex`, flexDirection:`column`, padding:`10px`, gap:`20px`}}>
          <TextField
              sx={{marginRight:`10px`}}
              id='name'
              error={textFieldError}
              helperText={textFieldError ? `Больше 2-х символов.` : null}
              label="Наименование"
              fullWidth
              value={name}
              onChange={handleNameChange}
          />
          <TextField
              id='descrip'
              error={textFieldError}
              label="Описание"
              fullWidth
              value={descrip}
              onChange={(event)=>setDescrip(event.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
      <Button onClick={() => {onClose()}}>Отмена</Button>
        <Button 
          title='Отправить на сервер запрос.'
          onClick={() => {       
            const res = {name:name, descrip:descrip}
            onClose(name.length>2 ? res: null)
          }}>Отправить</Button>
      </DialogActions>
    </Dialog>
  );
}