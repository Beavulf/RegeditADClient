import {Box, Button, Typography, TextField} from '@mui/material'
import { useState, useEffect } from 'react'
import LoginIcon from '@mui/icons-material/Login';
import { useSnackbar } from 'notistack';
import KeyIcon from '@mui/icons-material/Key';
import AlertDialog from './AlertDialog';
// import IMG from '../../../public/LogoRegeditAD.png'
import api from '../../apiAxios/Api';

const SERVER_ADDRESS = import.meta.env.VITE_SERVER_ADDRESS
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT

// запрос к серверу на авторизация и получение роли
async function authenticateUser(address) {
  try {
    const response = await api.post(`http://${SERVER_ADDRESS}:${SERVER_PORT}/login`, {
      address: address, // Отправляем JSON-данные с полем адреса в body
    });
    return response.data; //возвращаем роль
  } catch (error) {
    console.error('ОШИБКА:', error.response?.data.error || error.message);
    throw error.response?.data.error || error.message; // Пробрасываем ошибку для обработки в вызывающем коде
  }
}



export default function Login({onLogin}) {
  const { enqueueSnackbar } = useSnackbar(); 
  const [clientIp, setClientIp] = useState(`Сервер недоступен`)
  const [dialog, setDialog] = useState(false)
  const [login, setLogin] = useState(``)

    // атворизация на сервере и получение роли
    async function authAndGetRole(){
      // тут получить имя компа и авторизовать пользователя
      try {
        const userRole = await authenticateUser(clientIp) //возврат роли пользователя
        onLogin(userRole)
      }
      catch (err) {
        enqueueSnackbar(`Ошибка запроса к серверу - ${err}`, { variant: 'error' });
      }
    }

    // получение айпишники и проверка подключения к серверу
    const getAddressAndCheckConnect = async () => {
      try {
        const response = await api.get(`http://${SERVER_ADDRESS}:${SERVER_PORT}/adress`);
        setClientIp(response.data.ip);
        localStorage.setItem('clientIp', response.data.ip);
        enqueueSnackbar('Подключение к серверу УСПЕШНО.', { variant: 'success' });
      } catch (err) {
        enqueueSnackbar('Сервер не отвечает.', { variant: 'warning' });
        console.error('ОШИБКА (сервер не доступен)', err);
      }
    };
    useEffect(() => {
      getAddressAndCheckConnect();
    }, []);

    // отправка запрос на добавление пользователя в систему
    async function handleGetAccess(){
      if (login.length > 2){
        try {
          const response = await api.post(`http://${SERVER_ADDRESS}:${SERVER_PORT}/access`, {
            userData: {client:clientIp, login}, // Отправляем JSON-данные с полем username
          });           
          if (response.status === 200) {
            enqueueSnackbar('Запрос успешно отправлен.', { variant:'success' });
          } 
          setDialog(false)
        } catch (error) {
          enqueueSnackbar(`Ошибка при отправке запроса: ${error.response?.data?.error || error.message}`, { variant: 'error' });
        }
      } else {
        alert(`Введите Логин (больше 2-с символов).`)
      }
    }

    return (
        <>
            <Box sx={{display:'flex', justifyContent:'center',}}>
              {/* <img 
                src="../../../public/LogoRegeditAD1.png" 
                alt="Лого программы" 
                height='500px' 
                style={{ borderRadius:'20px',}}
              /> */}
              <Box sx={{m:'auto',p:1}}>
                <Typography variant="h4" gutterBottom>
                  <strong style={{color: `#ccc`}}>RegeditAD</strong>
                </Typography>
                <h1>Авторизация</h1>
                <h2 style={{color:`#ccc`}}>{clientIp.split('::')[1] === '1' ? 'localhost' : clientIp.split('::')[1]}</h2>
                <Button 
                  size='large'
                  variant="outlined" 
                  endIcon={<LoginIcon/>}
                  onClick={async ()=>await authAndGetRole()}
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
              </Box>
            </Box>

            
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