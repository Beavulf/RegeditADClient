import { useWebSocketContext, useClients, useUsers } from '../../websocket/WebSocketContext.jsx'
import {
    Button, 
    Typography, 
    Box, 
    List, 
    ListItem, 
    Paper, 
    AccordionSummary, 
    AccordionDetails, 
    Accordion,
    Checkbox,
    CircularProgress,
    useTheme,
    Switch,
    IconButton
} from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout';
import AppsIcon from '@mui/icons-material/Apps';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useState, useCallback, useMemo, useEffect } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import WebIcon from '@mui/icons-material/Web';
import LastPageIcon from '@mui/icons-material/LastPage';
import Settings from '../../Settings.jsx'
import {CurrentTimeDisplay} from './DateTImeCalendar.jsx'
import ColorSelect from '../ColorSelect.jsx'

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');
 
export default function Dashboard({router}){
    //получение данных с вебсокета
    const { loading } = useWebSocketContext()
    const Users = useUsers()
    const Clients = useClients()
    // const Clients = useMemo(() => clients || [], [clients]);
    const {sendJsonMessage} = useWebSocketContext()
    const [settings, setSettings] = useState(Settings())
    const [visual, setVisual] = useState(settings.btnStyle)
    const [checkedSwitchBtn, setCheckedSwitchBtn] = useState(settings.btnStyle === 'elevation' ? true : false)
    const theme = useTheme();
    const [useCustomCursors, setUseCustomCursors] = useState(() => {
      const stored = localStorage.getItem('useCustomCursors');
      return stored === 'true';
    });

    async function quitClient(ip){
      const message = {
        type: 'quitClientConnect',
        data: {
          targetIp:ip
        },
      }
      await sendJsonMessage(message)
    }

    // обновление настроек
    const updateSettings = useCallback((key, value) => {
        const newSettings = { ...settings, [key]: value };
        localStorage.setItem('settings', JSON.stringify(newSettings));
        setSettings(newSettings);   
    }, [settings]);

    // галочка для добавления на окно кнопки быстрого перехода
    const handleCheckboxChange = useCallback(
        (item, checked) => {
          const newFastTravelBtn = checked
            ? [...settings.fastTravelBtn, { ...item, txtColor: '', bgColor: '#9c92921d', icon: 'WebIcon' }]
            : settings.fastTravelBtn.filter(btn => btn.path !== item.path);
          updateSettings('fastTravelBtn', newFastTravelBtn);
        },
        [settings.fastTravelBtn, updateSettings]
    );

    // смена типа кнопок
    const handleChangeSwitchCheckedBtn = (event) => {
      setCheckedSwitchBtn(event.target.checked);
      if (event.target.checked) {
        setVisual('elevation')
        updateSettings('btnStyle', 'elevation');
      } else {
        setVisual('outlined')
        updateSettings('btnStyle', 'outlined');
      }            
    }

    // установка курсора
    useEffect(() => {
      localStorage.setItem('useCustomCursors', useCustomCursors);
      if (useCustomCursors) {
        document.body.classList.add('custom-cursors');
      } else {
        document.body.classList.remove('custom-cursors');
      }
    }, [useCustomCursors]);

    const renderButton = useCallback(
        (item, index) => (
          <Button
            key={index}
            onClick={() => router.navigate(item.path)}
            sx={{ minWidth: '400px', height: '100px', flexGrow: 1 }}
          >
            <Paper
              elevation={visual == `elevation` ? 8 : 0}
              variant={visual}
              sx={{
                display: 'flex',
                padding: '10px',
                alignItems: 'center',
                gap: '10px',
                justifyContent: 'space-evenly',
                flex: 1,
                height: '100%',
                bgcolor: item.bgColor,
              }}
            >
              <WebIcon />
              <Typography color={item.txtColor}>{item.name}</Typography>
              <LastPageIcon fontSize="large" />
            </Paper>
          </Button>
        ),
        [router, visual]
    );
    
    const renderListItem = useCallback(
        (item, index) => {
          const isChecked = settings.fastTravelBtn.some(btn => btn.path === item.path);
          const lastColor = settings.fastTravelBtn.find(btn => btn.path === item.path);
    
          return (
            <ListItem
              key={index}
              sx={{
                bgcolor: isChecked && `#9c92921d`,
                flex: '1 0 calc(33.33% - 10px)',
                maxWidth: 'calc(33.33% - 10px)',
                minWidth: '120px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Checkbox
                title='Добавить кнопку'
                checked={isChecked}
                onChange={(event) => handleCheckboxChange(item, event.target.checked)}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AppsIcon />
                <Typography>{item.name}</Typography>
                <ColorSelect
                  initialColor={isChecked ? lastColor?.bgColor || '#9c92921d' : '#9c92921d'}
                  onColorChange={(newColor) =>
                    updateSettings(
                      'fastTravelBtn',
                      settings.fastTravelBtn.map(btn =>
                        btn.path === item.path ? { ...btn, bgColor: newColor } : btn
                      )
                    )
                  }
                />
              </Box>
            </ListItem>
          );
        },
        [handleCheckboxChange, settings.fastTravelBtn, updateSettings]
      );

    const allFastBtn = [
        {name:`Дока и НАСТД`,path:`/prava/pdoka`},
        {name:`Сотрудники`,path:`/sotrudniki`},
        {name:`Отделы и должности`,path:`/admin-edit-table/otdel`},
        {name:`Пользователи`,path:`/admin-edit-table/users`},
        {name:`Прием на работу`,path:`/registry/priem`},
        {name:`Сброс пароля AD`,path:`/prava/sbrosad`},     
        // {name:`Отпуска`,path:`/otpysk`},
        {name:`Назначение`,path:`/registry/naznachenie`},
        {name:`Перевод`,path:`/registry/perevod`},
        {name:`Временный перевод`,path:`/registry/vperevod`},
        // {name:`Обучение`,path:`/obychenie`},
        // {name:`Стажировка`,path:`/stajirovka`},
        // {name:`Декреты`,path:`/dekret`},
        {name:`Изменение фамилии`,path:`/registry/familia`},
        {name:`Увольнение`,path:`/registry/uvolnenie`},
        {name:`Данные из ADTool`,path:`/registry/adtool`},
    ]
    
    return (
        <Box sx={{display:`flex`, justifyContent:`space-between`, alignItems:loading===true?`center`: ``}}>
            
            {loading ? <CircularProgress sx={{justifyContent:`center`, margin:`20% auto` }}/> : 
                <>
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', padding: '5px' }}>
                        <Accordion sx={{ flex: 1, bgcolor:theme.palette.primary.secondary }} >
                            <AccordionSummary
                                expandIcon={<SettingsIcon />}
                                aria-controls="panel1-content"
                                id="panel1-header"
                            >
                              Открыть настройки
                              <Typography component="span"></Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ overflow: 'auto', display: 'block' }}>
                              <Box sx={{display:`flex`, alignItems:`center`, margin:`5px 0`, border:`#635f5f1d 1px solid`, borderRadius:`8px`, gap:2}}>
                                <Box sx={{display:`flex`, alignItems:`center`}}>
                                  <Switch 
                                    title='Изменить тип кнопок (добавить тени)'
                                    checked={checkedSwitchBtn}
                                    onChange={handleChangeSwitchCheckedBtn}
                                  />
                                  <Typography component="span">Тип кнопок</Typography>
                                </Box>
                                |
                                <Button 
                                  title='Сменить курсор на кастомный (нажать снова чтобы вернуть)' 
                                  variant={useCustomCursors && 'contained' || 'outlined'} 
                                  onClick={()=>setUseCustomCursors((prev)=>!prev)}
                                >СМЕНИТЬ КУРСОР</Button>

                                <Button 
                                  color='error' 
                                  title='Сбросить настройки кнопок к дефолтным' 
                                  onClick={()=>{localStorage.removeItem('settings'); window.location.reload();}}
                                  sx={{marginLeft:'auto'}}
                                >сброс</Button>
                              </Box>
                              <Box sx={{display:`flex`, overflow:`auto`}}>
                                <List
                                  sx={{
                                      maxHeight: '300px',
                                      display: 'flex',
                                      flexWrap: 'wrap',
                                      gap: '10px',
                                      padding: 0,
                                      overflowY: 'auto',
                                  }}
                                >
                                  {allFastBtn.map(renderListItem)}
                                </List>
                              </Box>
                            </AccordionDetails>
                        </Accordion>
                    </Box>
                    <Box
                        sx={{
                        flex: 1,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1,
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        alignContent: 'flex-start',
                        }}
                    >
                        {settings.fastTravelBtn.map(renderButton)}
                    </Box>
                </Box>
    
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <CurrentTimeDisplay />
                <Box sx={{ flex: 1, border: 'GrayText solid 1px', borderRadius: '8px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 5px' }}>
                      <Typography>Подключенные пользователи:</Typography>
                      <IconButton title='Обновить' onClick={()=>sendJsonMessage({ type: 'getAllClientsIp' })}>
                        <RefreshIcon/>
                      </IconButton>
                    </Box>
                    <List sx={{ gap: 1, maxHeight: '240px', height: '240px', overflow: 'auto' }}>
                    {Clients.map((client, index) => (
                        <ListItem
                          key={index}
                          sx={{ alignItems: 'center', gap: 2, bgcolor: '#9c92921d', margin:'5px 0' }}
                        >
                        <PersonPinIcon />
                        <Typography>{Users.find(us=>us.address === client).name}</Typography>
                        {localStorage.getItem('userRole')==='admin' ? <IconButton size='small' onClick={()=>quitClient(client)} sx={{margin:'0 0 0 auto'}} title='Отключить пользователя'>
                          <LogoutIcon/>
                        </IconButton> : null
                        }
                        </ListItem>
                    ))}
                    </List>
                </Box>
                </Box>
            </>
            }
        </Box>
    )    
}