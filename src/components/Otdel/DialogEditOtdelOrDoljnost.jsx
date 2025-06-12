import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from '@mui/material';

export function DialogEditOtdelOrDoljnost({payload, open, onClose}) {
    const [descrip, setDescrip] = useState(`-`)
    const [name,setName] = useState(``)
    const [textFieldError, setTextFieldError] = useState(false)
  
    const handleNameChange = (event) => {
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