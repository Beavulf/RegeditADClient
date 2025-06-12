import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useState, useEffect, memo, useCallback } from 'react';
import { TextField, Box, MenuItem, Select, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useUsers, useSotrudnik, useOtdel, usePdoka } from '../../../websocket/WebSocketContext.jsx'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useDialogs } from '@toolpad/core/useDialogs';
import { useTableActions } from '../../../websocket/LayoutMessage.jsx';
import getWhoId from '../../users/GetWhoID.jsx'
import { useSetFocusAndText } from '../../hooks/SetFocusAndText.jsx';
import CAutoCompleate from '../../utils/CAutoCompleate.jsx';
import { useSnackbar } from 'notistack';

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

const DialogAddSotrudnik = memo(function DialogAddSotrudnik({ payload, open, onClose }) {
  const Users = useUsers()
  const Sotrudnik = useSotrudnik()
  const Otdel = useOtdel()
  const Pdoka = usePdoka()
  const {handleSetBlockedRow } = useTableActions();
  const dialogs = useDialogs();
  const { enqueueSnackbar } = useSnackbar();

  const [dataDob, setDataDob] = useState(dayjs(new Date()))
  const [datePrikaz, setDatePrikaz] = useState(dayjs(new Date())); //дата прика3а
  const [pto, setPto] = useState(''); //ПТО
  const [obosnovanie, setObosnovanie] = useState('ДЗ по GW'); //обоснование
  const [descrip, setDescrip] = useState('');
  const [selectedSotrudniki, setSelectedSotrudniki] = useState([]); //список сотрудников
  const [user, setUser] = useState(''); //кто выполнял
  const [sotrudnik, setSotrudnik] = useState(''); //выбранный сотрудник в автоподстановке
  const [formatedRows,setFormatedRows] = useState([]) //группа строк по совпадению даты и обоснования

  useSetFocusAndText(setSotrudnik, 'sotrudnik', true)
  
  const [error, setError] = useState({
    obosnovanie:false,
    user: false,
    pto: false,
    data: false
  })  

  //получение  группы строк по дате и тому кто добавил, для редактирования
  const getAddedGroup = useCallback(() => {
    const filterDataDob = payload?.data_dob || ''; 
    const filterWhoId = payload?._who?._id || '';    
    
    // Фильтруем массив
    const filteredItems = Pdoka.filter(item => {
        const matchesDate = item.data_dob === filterDataDob || !filterDataDob; // Если фильтр пустой, то пропускаем фильтрацию по дате
        const matchesWhoId = item._who._id === filterWhoId || !filterWhoId;    // Если фильтр пустой, то пропускаем фильтрацию по _who._id
        return matchesDate && matchesWhoId;
    });    
    const formattedItems = filteredItems.map(item => ({
        _pdoka: item._id,
        _id: item._sotr._id,   
        fio: item._sotr.fio,
        lnp: item.lnp,         
        action: item.type      
    }));
    return formattedItems;
  }, [Pdoka, payload]);

  // Заполняем начальные данные при открытии окна
  useEffect(() => {
    if (payload) {  
        const formattedItems = getAddedGroup()
        formattedItems.map(item=>{
            handleSetBlockedRow(item._pdoka,true,`Pdoka`)
        })
        setFormatedRows(formattedItems)
        setPto(payload._pto._id || '');
        setDescrip(payload.descrip || '');
        setDatePrikaz(dayjs(new Date(payload.data_prikaza)) || dayjs(new Date()));
        setObosnovanie(payload.obosnovanie || '');
        setSelectedSotrudniki(formattedItems);
        setUser(payload._who_do._id || '');
        setDataDob(payload.data_dob || '');
    }    
  }, [payload]);

  // добавление сотрудника в список
  const handleAddEmployee = useCallback(() => {
    const selected = Sotrudnik.find((o) => o._id === sotrudnik);
    if (selected && !selectedSotrudniki.some((item) => item._id === selected._id) && selected.lnp) {
      setSelectedSotrudniki([...selectedSotrudniki, { ...selected, action: 'Предоставить' }]);
      setSotrudnik(null)
      return;
    }
    setSotrudnik(null)
    enqueueSnackbar('Сотрудник уже в списке, либо без ЛНП.', { variant: 'warning' });
    return;
  }, [Sotrudnik, sotrudnik, selectedSotrudniki]);

  // удаление сотрудника из списка
  const handleRemoveEmployee = useCallback((id) => {
    setSelectedSotrudniki(selectedSotrudniki.filter((item) => item._id !== id));
  }, [selectedSotrudniki]);

  // изменение действия сотрудника в списке
  const handleActionChange = useCallback((id, newAction) => {
    setSelectedSotrudniki(
      selectedSotrudniki.map((item) =>
        item._id === id ? { ...item, action: newAction } : item
      )
    );
  }, [selectedSotrudniki]);

  // возвращает данные для отправки на сервер
  const returnData = useCallback(()=>{
    let resData = []
    selectedSotrudniki.map((sotr)=>{
        const resSotr ={
            _pdoka:sotr._pdoka,
            _pto:pto,
            _sotr:sotr._id, 
            type:sotr.action, 
            lnp:sotr.lnp, 
            obosnovanie:obosnovanie,
            data_prikaza:datePrikaz, 
            data_dob: dataDob, 
            _who:getWhoId(payload,Users),
            _who_do: user,
            descrip:descrip
        }
        resData.push(resSotr)
    })
  
    return resData
  }, [selectedSotrudniki, pto, obosnovanie, datePrikaz, dataDob, user, descrip, payload, Users]);

  const handleChangePto = useCallback((newValue) => {
    setPto(newValue ? newValue._id : '');
    if (newValue) {
        setError({...error, pto: false });
    } else {
        setError({...error, pto: true });
    }
  }, [error])

  const handleChangeSotrudnik = useCallback((newValue) => {
    setSotrudnik(newValue ? newValue._id : '');
    if (newValue) {
        setError({...error, sotrudnik: false });
    } else {
        setError({...error, sotrudnik: true });
    }
  }, [error])

  const handleChangeUser = useCallback((newValue) => {
    setUser(newValue ? newValue._id : '');
    if (newValue) {
        setError({...error, user: false });
    } else {
        setError({...error, user: true });
    }
  }, [error])


  const renderEmployeeRow = useCallback((sotr) => {
    return (
        <TableRow  key={sotr._id} sx={{animation: 'fadeIn 0.5s ease-in', '@keyframes fadeIn': {
            '0%': {
                opacity: 0,
                transform: 'translateY(-10px)'
            },
            '100%': {
                opacity: 1,
                transform: 'translateY(0)'
            }
        }}}>
        <TableCell>{sotr.fio}</TableCell>
        <TableCell>{sotr.lnp}</TableCell>
        <TableCell>
            <Select
                value={sotr.action}
                onChange={(event) =>
                    handleActionChange(sotr._id, event.target.value)
                }
                fullWidth={true}
                size='small'
            >
            <MenuItem value="Предоставить">Предоставить</MenuItem>
            <MenuItem value="Лишить">Лишить</MenuItem>
            </Select>
        </TableCell>
        <TableCell>
            <Button
                variant="contained"
                color="secondary"
                onClick={() => handleRemoveEmployee(sotr._id)}
                title='Удалить из списка'
            >
                Убрать
            </Button>
        </TableCell>
        </TableRow>
    )
  }, [handleRemoveEmployee, handleActionChange])

  return (
    <Dialog maxWidth="80vw" open={open} onClose={() => onClose()}
    onKeyDown={(event) => {
        if (event.key === 'Enter' && sotrudnik) {
            event.preventDefault(); 
            handleAddEmployee();
        }
    }}>
      <DialogTitle>Выдача прав:<Typography color="secondary">{payload && `ГРУППА - ${payload?._pto?.name}`}</Typography></DialogTitle>
      <DialogContent sx={{width:`700px`}}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: `20px`, padding:`20px 0` }}>
            <Box sx={{display:`flex`, gap:`20px`, justifyContent:`space-between`}}>
                {/* Поле для ввода ПТО */}
                <CAutoCompleate
                    idComp='pto'
                    label='ПТО*'
                    memoizedData={Otdel}
                    elementToSelect={pto}
                    onChangeElement={handleChangePto}
                    optionLabel='name'
                />
                <DatePicker 
                    label="Дата выполнения"
                    value={datePrikaz} 
                    onChange={(newValue) => {
                        if (newValue) {
                            setDatePrikaz(newValue);
                            setError({...error, data: false });
                        } else {
                            setError({...error, data: true });
                        }
                    }} 
                />
            </Box>  

            <Box sx={{display:`flex`, flexDirection:`column`}}>
                <Box sx={{display:`flex`, justifyContent:`space-between`, alignItems:`center`, gap:`10px`}}>
                    <Typography>Сотрудники:</Typography>
                    <CAutoCompleate
                        idComp='sotrudnik'
                        label='Сотрудник*'
                        memoizedData={Sotrudnik}
                        elementToSelect={sotrudnik}
                        onChangeElement={handleChangeSotrudnik}
                        getNewOptionLabel={(option) => `${option.fio} (${option.lnp})`} 
                        newSize='small'
                    />
                    <Button
                        disabled={payload && true}
                        variant="contained"
                        color="primary"
                        onClick={handleAddEmployee}
                        title='Добавить сотрудника в список'
                    >
                        Добавить
                    </Button>
                </Box>

                <Box
                    sx={{
                        maxHeight: '350px', // Ограничиваем высоту таблицы
                        overflowY: 'auto',  // Включаем вертикальный скролл
                    }}
                >         
                    {/* Таблица выбранных сотрудников */}
                    <Table sx={{ width: '100%', height:`300px`, borderRadius:`8px`, mt:'5px' }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{width:`250px`, textAlign:'center'}}>ФИО</TableCell>
                                <TableCell sx={{width:`50px`, textAlign:'center'}}>ЛНП</TableCell>
                                <TableCell sx={{width:`200px`, textAlign:'center'}}>Действие</TableCell>
                                <TableCell sx={{width:`100px`, textAlign:'center'}}> 
                                    <Button title='Удалить весь список' size='small' onClick={()=>setSelectedSotrudniki([])}>Очистить</Button> 
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody >
                        {selectedSotrudniki.length > 0 && selectedSotrudniki.map((sotr) => (
                            renderEmployeeRow(sotr)
                        )) || 
                        <TableRow>
                            <TableCell colSpan={4} sx={{textAlign: 'center'}}>
                                <Typography color="gray">Список пуст... <br/>(добавить можно выше)</Typography>
                            </TableCell>
                        </TableRow>
                        }
                        </TableBody>
                    </Table>
                </Box>
                <Box sx={{display:`flex`, gap:`20px`, marginTop:1}}>
                    <TextField
                        id="obosnovanie"
                        error={obosnovanie.trim().length <=2}
                        helperText={obosnovanie.trim().length <=2 ? 'Больше 2-х символов.' : null}
                        label="Обоснование"
                        sx={{flex:1}}
                        value={obosnovanie}
                        title='Вписать обоснование выдачи, если таково имеется'
                        onChange={(event)=>{ setObosnovanie(event.target.value); }}
                        size='small'
                    />
                    <CAutoCompleate
                        idComp='user'
                        label='Кто выполнял*'
                        memoizedData={Users}
                        elementToSelect={user}
                        onChangeElement={handleChangeUser}
                        optionLabel='name'
                        newSize='small'
                        flex={0.5}
                    />
                </Box>
                <TextField
                    sx={{marginTop:2}}
                    id="descrip"
                    label="Описание..."
                    fullWidth
                    value={descrip}
                    onChange={(event)=>setDescrip(event.target.value)}
                    title='Любые примечания к выдаче прав'
                />
            </Box>        

        </Box>
      </DialogContent>

      <DialogActions>
        <Button title='Отмена' onClick={() => {
            formatedRows.map(item=>{
                handleSetBlockedRow(item._pdoka,false,`Pdoka`)
            })  
            onClose()
            }}
        >Отмена</Button>
        <Button
          title="Отправить запрос на сервер"
          onClick={async () => {    
            if ([selectedSotrudniki, pto, obosnovanie, user].some((value) => value.length === 0)) {
                await dialogs.alert(`Корректно заполните все поля.`)
                return;
            }
            const res = await returnData()                     
            onClose(res);
          }}
        >
          Отправить
        </Button>
      </DialogActions>

    </Dialog>
  );
})

export default memo(DialogAddSotrudnik)