import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import Box from '@mui/material/Box';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useSnackbar } from 'notistack';//
import { AppProvider } from '@toolpad/core/react-router-dom';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout, ThemeSwitcher } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import { useDemoRouter } from '@toolpad/core/internal';
import {Button, IconButton, Typography} from '@mui/material'
import Chip from '@mui/material/Chip';
import Users from '../users/Users.jsx';
import Otdel from '../Otdel/Otdel.jsx';
import Sotrudniki from '../Sotrudniki/Sotrudniki.jsx';
import Doka from '../Prava/Doka/Doka.jsx';
import Dashboard from '../Dashboard/Dashboard.jsx';
import Priem from '../regestry/Priem/Priem.jsx';
import SbrosAD from '../Prava/SbrosAD/SbrosAD.jsx';
import Subject from '../Subject/Subject.jsx';
import Access from '../Access/Access.jsx';
import Feedback from './Feedback.jsx'
import Naznachenie from '../regestry/Naznachenie/Naznachenie.jsx'
import Perevod from '../regestry/Perevod/Perevod.jsx'
import VPerevod from '../regestry/VPerevod/VPerevod.jsx'
import Familia from '../regestry/Familia/Familia.jsx'
import Uvolnenie from '../regestry/Uvolnenie/Uvolnenie.jsx'
import Info from '../Info/Info.jsx'
import Updates from '../Info/Updates.jsx'
import Zapros from '../programms/Zapros/Zapros.jsx'
import Svodka from '../programms/Svodka/Svodka.jsx'
import Revizor from '../programms/Revizor/Revizor.jsx'
import Chdti from '../programms/Chdti/Chdti.jsx'
import Aipsin from '../programms/Aipsin/Aipsin.jsx'
import ADTool from '../regestry/ADTool/ADTool.jsx'
import Stajirovka from '../regestry/Stajirovka/Stajirovka.jsx';
import SotrInfo from '../SotrInfo/SotrInfo.jsx'
import ZaprosSPrava from '../regestry/ZaprosSPrava/ZaprosSPrava.jsx'
import SessionTimer from './SessionTimer';

import { createNavigation } from './NAVIGATION.jsx'
import { useReadyState, useLastMessage, useAccess } from '../../websocket/WebSocketContext.jsx'
import styles from './Main.module.css'
import demoTheme from '../../theme/theme';
import dayjs from 'dayjs';

// const storedRole =  || 'NONE';

//во3врат главного компонента (страницы)
function MainLayout(props) {
  const lastUpdate = import.meta.env.VITE_DATE_UPDATE
  const router = useDemoRouter('/dashboard');  
  const AccessDB = useAccess()
  const readyState = useReadyState();
  const lastJsonMessage = useLastMessage();
  const { enqueueSnackbar } = useSnackbar(); 
  const navigate = useNavigate()
  
  // установка флага NEW если есть новое обновление
  useEffect(()=>{
    const localLastUpdate = localStorage.getItem('lastUpdate');
    if (localLastUpdate) {
      if (localLastUpdate !== lastUpdate) {
        localStorage.setItem('checkUpdate', false)
        localStorage.setItem('lastUpdate', lastUpdate)
      }
    } else {
      localStorage.setItem('checkUpdate', false)
      localStorage.setItem('lastUpdate', lastUpdate)   
    }
  },[])

  // фильтруем меню навигаци в соответствию с ролью
  function filterNavigationByRole(navigation, userRole) {
    return navigation
      .filter((item) => {
        // Элемент доступен, если поле `roles` отсутствует или содержит текущую роль
        if (!item.roles || item.roles.includes(userRole)) {
          // Если есть дочерние элементы, рекурсивно фильтруем их
          if (item.children) {
            item.children = filterNavigationByRole(item.children, userRole);
          }
          return true;
        }
        return false;
      });
  }
  const resNavigation = createNavigation(AccessDB)
  const filteredNAVIGATION = filterNavigationByRole(resNavigation,localStorage.getItem('userRole'))

  //пока3 уведомленией
  const showNotif = useCallback((lastJsonMessage) => {
    const info = `(${lastJsonMessage.collection})`
    if (lastJsonMessage.type) {
      switch (lastJsonMessage.type) {
        case `insert`:
          enqueueSnackbar(`Добавление новой записи в БД. ${info}`, { variant: `info` });
          break;
        case `delete`:
          enqueueSnackbar(`Удаление записи в БД. ${info}`, { variant: `info` });
          break;
        case `quit`:
          alert('Вас отключил администратор')
          navigate('/logout'); // Это эквивалент window.location.reload()
          break;
        default:
          break;
      }
    }
    if (lastJsonMessage.error) {
      console.log(lastJsonMessage.error);
      enqueueSnackbar(`Ошибка при работе с БД: ${lastJsonMessage.error}`, { variant: `error` });
      if (lastJsonMessage.cmd === 'logout') {
        alert(`Время вашей сессии истекло. Авторизуйтесь снова.`);
        navigate('/logout');
      }
    }
  }, [navigate, enqueueSnackbar]);

  // обертка для проверки доступа к странице
  const ProtectedRoute = ({ children }) => {
    const storedRole = localStorage.getItem('userRole');
    const router = useDemoRouter('/dashboard');
  
    useEffect(() => {
      if (storedRole !== 'admin') {
        router.navigate('/dashboard');
      }
    }, [router]);
  
    return storedRole === 'admin' ? children : null;
  };

  // постоянная проверка последних сообщений сервера для отправки оповещений
  useEffect(() => {
    if (lastJsonMessage && Object.keys(lastJsonMessage).length > 0) {
      showNotif(lastJsonMessage)
    }
  }, [lastJsonMessage, showNotif]); 

  //слот строки монитринга онлайн офлайн сервера
  const toolbarActions = useCallback((readyState)=>{
    return (
      <Box sx={{display:`flex`, flexDirection:`row`, justifyContent:`space-between`, margin:`0px`, alignItems:'center', gap:1}}>
        <SessionTimer />
        <p className={readyState===1 ? styles.online : styles.ofline}>{`${readyState === 0 ? 'Connecting...' : readyState === 1 ? 'Online' : 'Offline'}`}</p>
        <ThemeSwitcher />
      </Box>
    )
  },[]);
  
  // нижняя часть бокового меню для кнопок настройки
  const SidebarFooter = ()=> {
    return (
      <Box>
        <Box>
          <Box sx={{display:'flex'}}>
            <Button fullWidth variant='text' onClick={()=>router.navigate('/info')}>info</Button>
            <Button fullWidth variant='text' 
              onClick={()=>{router.navigate('/updates'); localStorage.setItem('checkUpdate', true)}}
            >
              обнов.{localStorage.getItem('checkUpdate') === 'false' ? <Chip color='primary' label='NEW' /> : null}
            </Button>
          </Box>
          <Button fullWidth variant='text' onClick={()=>router.navigate('/feedback')}>жалобы и предложения</Button>
        </Box>
        <Box sx={{ display: 'flex', justifyContent:`space-between`, alignItems:`center`, padding:`0 15px` }}>
          <Typography>Вы: </Typography>
          <Typography style={{color:`#ff4081`}}>{localStorage.getItem('clientIp').split('::')[1]}</Typography>
          <div>
            <IconButton
              size="large"
            >
            <SettingsIcon />
            </IconButton>
            <IconButton
              size="large"
              href='/login'
              title='Выйти'
            >
              <LogoutIcon />                       
            </IconButton>  
          </div>
              
        </Box>
      </Box>
    );
  }

  const renderRoutes = useMemo(() => (
    <>
      {router.pathname.includes(`/users`) && <ProtectedRoute><Users /></ProtectedRoute>}
      {router.pathname.includes(`/otdel`) && <ProtectedRoute><Otdel /></ProtectedRoute>}
      {router.pathname.includes(`/sotrudniki`) && <Sotrudniki tath={router.pathname}/>}
      {router.pathname.includes(`/pdoka`) && <Doka tath={router.pathname}/>}
      {router.pathname.includes(`/dashboard`) && <Dashboard tath={router.pathname} router={router}/>}
      {router.pathname.includes(`/priem`) && <Priem />}
      {router.pathname.includes(`/sbrosad`) && <SbrosAD />}
      {router.pathname.includes(`/subject`) && <Subject />}
      {router.pathname.includes(`/access`) && <ProtectedRoute><Access /></ProtectedRoute>}
      {router.pathname.includes(`/feedback`) && <Feedback />}
      {router.pathname.includes(`/naznachenie`) && <Naznachenie />}
      {router.pathname.includes(`/perevod`) && <Perevod />}
      {router.pathname.includes(`/vperevod`) && <VPerevod />}
      {router.pathname.includes(`/familia`) && <Familia />}
      {router.pathname.includes(`/uvolnenie`) && <Uvolnenie router={router} />}
      {router.pathname.includes(`/info`) && <Info />}
      {router.pathname.includes(`/updates`) && <Updates />}
      {router.pathname.includes(`/zapros`) && <Zapros />}
      {router.pathname.includes(`/svodka`) && <Svodka />}
      {router.pathname.includes(`/revizor`) && <Revizor />} 
      {router.pathname.includes(`/chdti`) && <Chdti />}
      {router.pathname.includes(`/aipsin`) && <Aipsin />}
      {router.pathname.includes(`/adtool`) && <ADTool />}
      {router.pathname.includes(`/stajirovka`) && <Stajirovka />}
      {router.pathname.includes(`/sotrinfo`) && <SotrInfo />}
      {router.pathname.includes(`/zaprsprava`) && <ZaprosSPrava />}

    </>
  ), [router.pathname]);
  
  return (
    <AppProvider
      navigation={filteredNAVIGATION}
      router={router}
      theme={demoTheme}
      branding={{title:`RegeditAD | ${localStorage.getItem('userRole').toUpperCase()}`}}  
    >
      <DashboardLayout slots = {{
          toolbarActions: ()=>toolbarActions(readyState),
          sidebarFooter: SidebarFooter,
        }}>   
          <PageContainer maxWidth={false} className=''>
              {renderRoutes}
          </PageContainer>
        </DashboardLayout>
    </AppProvider>
  );
}

export default MainLayout;
