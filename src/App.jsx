import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login/Login.jsx';
import './App.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Main from './components/Main/Main.jsx';
import {  useSnackbar } from 'notistack';
import { WebSocketProvider } from './websocket/WebSocketContext.jsx';
import Settings from './Settings.jsx';

// Компонент для выполнения логаута
const LogoutComponent = ({ onLogout }) => {
  useEffect(() => {
    onLogout();
  }, [onLogout]);
  
  return <Navigate to="/login" />;
};

// Тема оформления
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const SERVER_ADDRESS = import.meta.env.VITE_SERVER_ADDRESS
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT

function App() {
  const [auth, setAuth] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  //проверка наличия параметров курсоров если нет то установка по умолчанию
  const checkCurosr = () => {
    if (localStorage.getItem('defaultCursor')) {
      return;
    }
    else {
      localStorage.setItem('defaultCursor', 'normsl u.cur');
      localStorage.setItem('pointerCursor', 'link 700.cur');
    }
  }

  // инициация параметров для смены курсоров normsl u.cur  - link 700.cur
  const injectCursorStyles = () => {
    const style = document.createElement('style')
    style.textContent = `
      :root {
        --cursor-default: url('http://${SERVER_ADDRESS}:${SERVER_PORT}/static/cursors/${localStorage.getItem('defaultCursor')}'), auto;
        --cursor-pointer: url('http://${SERVER_ADDRESS}:${SERVER_PORT}/static/cursors/${localStorage.getItem('pointerCursor')}'), pointer;
      }
    `
    document.head.appendChild(style)
  }
  useEffect(()=>{
    checkCurosr()
    injectCursorStyles()
    if (!auth) {
      localStorage.removeItem('userRole')
      localStorage.removeItem('clientIp')
    }
  },[])

  // атворизация пользователя после получение токена
  function handleAuthUser(tokenAndRole) {
    if (tokenAndRole.role) {
      localStorage.setItem('userRole', tokenAndRole.role);
      setAuth(true);
      Settings()
      enqueueSnackbar('Успешная авторизация', { variant: 'success' });
    } else {
      setAuth(false);
      enqueueSnackbar('Ошибка авторизации, пользователь не найден.', { variant: 'error' });
    }
  }

  const handleLogout = () => {
    setAuth(false);
    localStorage.setItem('userRole', 'manager');
    localStorage.removeItem('clientIp');
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Routes>
        {/* Маршрут для страницы входа */}
        <Route
          path="/login"
          element={
            auth ? <Navigate to="/dashboard" /> : (<Login onLogin={handleAuthUser} />)
          }
        />

        {/* Маршрут для главной (авторизованной) части */}
        <Route
          path="/dashboard/*"
          element={
            auth ? (
              <WebSocketProvider>
                <Main/>
              </WebSocketProvider>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Маршрут для выхода из системы */}
        <Route 
          path="/logout" 
          element={<LogoutComponent onLogout={handleLogout} />}
        />

        {/* Редирект с корневого пути */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </ThemeProvider>
  );
}

export default function IntegrationNotistack() {
  return (
    <App />
  );
}
