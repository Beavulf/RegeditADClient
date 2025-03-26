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
  const [token, setToken] = useState(null);  

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
  },[])

  // Проверка токена на авторизацию
  function handleLogin(tokenAndRole) {
    if (tokenAndRole.token) {
      setToken(tokenAndRole.token);
      localStorage.setItem('userRole', tokenAndRole.role);
      setAuth(true);
      Settings()
      enqueueSnackbar('Успешная авторизация', { variant: 'success' });
    } else {
      setAuth(false);
      enqueueSnackbar('Ошибка авторизации, пользователь не найден.', { variant: 'error' });
    }
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Routes>

        {/* Маршрут для страницы входа */}
        <Route
          path="/login"
          element={
            auth ? <Navigate to="/dashboard" /> : (<Login onLogin={handleLogin} />)
          }
        />
        {/* <Route
          path="/logout"
          element={
            <Login  />
          }
        /> */}
        {/* Маршрут для главной (авторизованной) части */}
        <Route
          path="/dashboard/*"
          element={
            auth ? (
              <WebSocketProvider token={token}>
                <Main token={token} />
              </WebSocketProvider>
            ) : (
              <Navigate to="/login" />
            )
          }
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
