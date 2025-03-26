import {Box, Button, Typography, TextField} from '@mui/material'
import { useState, useEffect } from 'react'
import LoginIcon from '@mui/icons-material/Login';
import { useSnackbar } from 'notistack';
import KeyIcon from '@mui/icons-material/Key';
import AlertDialog from './AlertDialog';
import axios from 'axios';

const SERVER_ADDRESS = import.meta.env.VITE_SERVER_ADDRESS
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT

async function authenticateUser(address) {
  try {
    const response = await axios.post(`http://${SERVER_ADDRESS}:${SERVER_PORT}/login`, {
      address: address, // Отправляем JSON-данные с полем username
    });

    const data = response.data; // Получаем данные из ответа
    if (data.token) {
      return { token: data.token, role: data.role }; // Возвращаем JWT-токен и роль
    } else {
      // throw new Error('Ошибка аутентификации - пользователь не найден');
    }
  } catch (error) {
    console.error('ОШИБКА:', error.response?.data || error.message);
    throw error; // Пробрасываем ошибку для обработки в вызывающем коде
  }
}

export default function Login({onLogin}) {
  const { enqueueSnackbar } = useSnackbar(); 
  const [clientIp, setClientIp] = useState(`Сервер недоступен`)
  const [dialog, setDialog] = useState(false)
  const [login, setLogin] = useState(``)

    async function getToken(){
      // тут получить имя компа и авторизовать пользователя
      try {
        const tokenAndRole = await authenticateUser(clientIp)
        onLogin(tokenAndRole)
      }
      catch {
        enqueueSnackbar('Ошибка авторизации, пользователь не найден.', { variant: 'error' });
      }
    }

    //получение айпишники и проверка подключения к серверу
    useEffect(() => {
        fetch(`http://${SERVER_ADDRESS}:${SERVER_PORT}/adress`)
          .then(response => response.json())
          .then(data=> {
            setClientIp(data.ip)
            localStorage.setItem('clientIp', data.ip)
            enqueueSnackbar('Подключение к серверу УСПЕШНО.', { variant: 'success' });
          })
          .catch(err=>{
            enqueueSnackbar('Сервер не отвечает.', { variant: 'warning' });
            console.error('ОШИБКА (сервер не доступен)',err)
          })   
    },[])

    async function handleGetAccess(){
      if (login.length > 2){
        try {
          const response = await axios.post(`http://${SERVER_ADDRESS}:${SERVER_PORT}/access`, {
            text: {client:clientIp, login:login}, // Отправляем JSON-данные с полем username
          }); 
          if (response.status === 200) {
            enqueueSnackbar('Запрос успешно отправлен.', { variant:'success' });
          } 
          setDialog(false)
        } catch (error) {
          if (error){
            enqueueSnackbar(`Ошибка при отправке запроса. ${error.response.data.error}`, { variant: 'warning' });          
          }
          throw error; // Пробрасываем ошибку для обработки в вызывающем коде
        }
      } else {
        alert(`Введите Логин (больше 2-с символов).`)
      }
    }

    return (
        <>
            <Typography variant="h4" gutterBottom>
              <strong style={{color: `#ccc`}}>RegeditAD</strong>
            </Typography>
            <h1>Авторизация</h1>
            <h2 style={{color:`#ccc`}}>{clientIp}</h2>
            <Button 
              size='large'
              variant="outlined" 
              endIcon={<LoginIcon/>}
              onClick={async ()=>await getToken()}
              >ВОЙТИ
            </Button> 

            <br />

            <Button  
              variant="text"
              sx={{color:`#cccc`, marginTop: `20px`}}
              size='small'
              endIcon={<KeyIcon/>}
              onClick={()=>setDialog(true)}
              >Запросить доступ
            </Button>

            
            <AlertDialog
              open={dialog}
              onClose={()=>setDialog(false)}
              title="Запрос"
              aria-labelledby="dialog-title"
              content={
                <Box sx={{gap:2, display:`flex`, flexDirection:`column`}}>
                  <Typography>Отправить запрос на предоставление доступа?</Typography>
                  <TextField 
                    value={login} 
                    onChange={(event)=>setLogin(event.target.value)} 
                    fullWidth={true} 
                    title='Ваш логин учетной записи' 
                    label='Логин*' 
                    size='small' 
                    sx={{}}>
                  </TextField>
                </Box>
              }
              actions={
                <>
                  <Button onClick={()=>setDialog(false)}>Отмена</Button>
                  <Button onClick={()=>handleGetAccess()} color="primary">
                    Подтвердить
                  </Button>
                </>
              }
            /> 
              
        </>
    )
}