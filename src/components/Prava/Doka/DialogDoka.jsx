import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useState, useEffect, memo, useCallback } from 'react';
import { TextField, Box, MenuItem, Select, FormControl, Autocomplete, Typography, Table, TableBody, TableCell, TableHead, TableRow, useTheme } from '@mui/material';
import { useUsers, useSotrudnik, useOtdel, usePdoka } from '../../../websocket/WebSocketContext.jsx'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useDialogs } from '@toolpad/core/useDialogs';
import { useTableActions } from '../../../websocket/LayoutMessage.jsx';
import getWhoId from '../../users/GetWhoID.jsx'
import { useSetFocusAndText } from '../../hooks/SetFocusAndText.jsx';
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
  const theme = useTheme();

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
    who: false,
    data: false
  })  

  //получение  группы строк по дате и тому кто добавил, для редактирования
  const getAddedGroup = useCallback(() => {
    const filterDataDob = payload.data_dob || '';  // дата, по которой фильтруем
    const filterWhoId = payload._who._id || '';    // id пользователя, по которому фильтруем
    
    // Фильтруем массив
    const filteredItems = Pdoka.filter(item => {
        const matchesDate = item.data_dob === filterDataDob || !filterDataDob; // Если фильтр пустой, то пропускаем фильтрацию по дате
        const matchesWhoId = item._who._id === filterWhoId || !filterWhoId;    // Если фильтр пустой, то пропускаем фильтрацию по _who._id
        return matchesDate && matchesWhoId;
    });    
    const formattedItems = filteredItems.map(item => ({
        _pdoka: item._id,
        _id: item._sotr._id,       // ID сотрудника
        fio: item._sotr.fio,       // ФИО сотрудника (предположим, что оно есть в _who)
        lnp: item.lnp,            // ЛНП
        action: item.type      // Действие (например, добавление или редактирование)
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
    if (selected && !selectedSotrudniki.some((item) => item._id === selected._id)) {
      setSelectedSotrudniki([...selectedSotrudniki, { ...selected, action: 'Предоставить' }]);
    }
    setSotrudnik(null)
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
    selectedSotrudniki.forEach((sotr)=>{
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

  return (
    <Dialog maxWidth="80vw" open={open} onClose={() => onClose()}
    onKeyDown={(event) => {
        if (event.key === 'Enter' && sotrudnik) {
            event.preventDefault(); 
            handleAddEmployee();
        }
    }}>
      <DialogTitle>Выдача прав:<Typography color="secondary">{payload && "ГРУППА"}</Typography></DialogTitle>
      <DialogContent sx={{width:`700px`}}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: `20px`, padding:`20px 0` }}>
            <Box sx={{display:`flex`, gap:`20px`, justifyContent:`space-between`}}>
                {/* Поле для ввода ПТО */}
                <FormControl fullWidth>
                    <Autocomplete
                        id="pto"
                        value={Otdel.find(o => o._id === pto) || null}
                        onChange={(event, newValue) => {
                            setPto(newValue ? newValue._id : '');
                            if (newValue) {
                                setError({...error, pto: false });
                            } else {
                                setError({...error, pto: true });
                            }
                        }}
                        onInputChange={(event, value) => {
                            // Фильтруем варианты по введенному значению
                            const filteredOptions = Otdel.filter(option => option.name.toLowerCase().includes(value.toLowerCase()));

                            // Если после фильтрации остался только один вариант, автоматически выбираем его
                            if (filteredOptions.length === 1) {
                                setPto(filteredOptions[0]._id);
                                setError({...error, pto: false });
                                event?.target?.blur();
                            }
                        }}
                        options={Otdel}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) => option._id === value?._id}
                        title='Выбор ПТО'
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                error={error.pto}
                                helperText={error.pto ? "Выберите ПТО" : ``}
                                label="ПТО"
                                variant="outlined"
                            />
                        )}
                    />
                </FormControl>

                <DatePicker 
                    label="Дата выполнения"
                    value={datePrikaz} 
                    slotProps={{
                        textField: {
                            error: error.data,
                            helperText: error.data ? "Некорректный ввод даты" : "",
                        },
                    }}
                    onChange={(newValue) => {setDatePrikaz(newValue);
                        if (newValue) {
                            setError({...error, data: false });
                        } else {
                            setError({...error, data: true });
                        }
                    }} 
                />
            </Box>  

            <Box sx={{display:`flex`, flexDirection:`column`}}>
                <Box sx={{display:`flex`, justifyContent:`space-between`, alignItems:`center`, gap:`10px`}}>
                    <Typography>Список сотрудников:</Typography>
                    <FormControl sx={{width:`400px`}}>
                        <Autocomplete
                            id="sotrudnik"
                            value={Sotrudnik.find(o => o._id === sotrudnik) || null}
                            onChange={(event, newValue) => setSotrudnik(newValue ? newValue._id : '')}
                            onInputChange={(event, value) => {
                                // Фильтруем варианты по введенному значению
                                const filteredOptions = Sotrudnik.filter(option => 
                                    option.fio.toLowerCase().includes(value.toLowerCase()) ||
                                    String(option.lnp).includes(value)
                                );
    
                                // Если после фильтрации остался только один вариант, автоматически выбираем его
                                if (filteredOptions.length === 1) {
                                    setSotrudnik(filteredOptions[0]._id);
                                    setError({...error, pto: false });
                                    event?.target?.blur();
                                }
                            }}
                            options={Sotrudnik}
                            getOptionLabel={(option) => `${option.fio} (${option.lnp})`}
                            isOptionEqualToValue={(option, value) => option._id === value?._id}
                            title='Выбор сотрудника'
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Сотрудники"
                                    variant="outlined"
                                    size='small'
                                />
                            )}
                            
                        />
                    </FormControl>
                    <Button
                        disabled={payload && true}
                        variant="contained"
                        color="primary"
                        onClick={handleAddEmployee}
                        sx={{height:`100%`}}
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
                    <Table sx={{ width: '100%', height:`300px`, bgcolor:theme.palette.primary.secondary, borderRadius:`8px` }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{width:`250px`, textAlign:'center'}}>ФИО</TableCell>
                                <TableCell sx={{width:`50px`, textAlign:'center'}}>ЛНП</TableCell>
                                <TableCell sx={{width:`200px`, textAlign:'center'}}>Действие</TableCell>
                                <TableCell sx={{width:`100px`, textAlign:'center'}}> 
                                    <Button title='Удалить весь список' size='small' onClick={()=>setSelectedSotrudniki([])}>Удалить</Button> 
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody >
                        {selectedSotrudniki.map((sotr) => (
                            <TableRow  key={sotr._id}>
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
                        ))}
                        </TableBody>
                    </Table>
                </Box>
                <Box sx={{display:`flex`, gap:`20px`, marginTop:1}}>
                    <TextField
                        id="obosnovanie"
                        error={error.obosnovanie}
                        helperText={error.obosnovanie ? 'Больше 2-х символов.' : null}
                        label="Обоснование"
                        fullWidth
                        value={obosnovanie}
                        title='Вписать обоснование выдачи, если таково имеется'
                        onChange={(event)=>{
                            setObosnovanie(event.target.value); 
                            if (event.target.value.trim().length <= 2){
                                setError((prev)=>({...prev, obosnovanie:true}))
                            } else { setError((prev)=>({...prev, obosnovanie:false})) }
                        }}
                        size='small'
                    />
                    <FormControl sx={{width:`400px`}}>
                        <Autocomplete
                            id="user"
                            value={Users.find(o => o._id === user) || null}
                            onChange={(event, newValue) => {
                                setUser(newValue ? newValue._id : '');
                                if (newValue) {
                                    setError({...error, who: false });
                                } else {
                                    setError({...error, who: true });
                                }
                            }}
                            options={Users}
                            onInputChange={(event, value) => {
                                // Фильтруем варианты по введенному значению
                                const filteredOptions = Users.filter(option => option.name.toLowerCase().includes(value.toLowerCase()));
    
                                // Если после фильтрации остался только один вариант, автоматически выбираем его
                                if (filteredOptions.length === 1) {
                                    setUser(filteredOptions[0]._id);
                                    setError({...error, pto: false });
                                    event?.target?.blur();
                                }
                            }}
                            getOptionLabel={(option) => option.name}
                            isOptionEqualToValue={(option, value) => option._id === value?._id}
                            renderInput={(params) => (
                                <TextField
                                {...params}
                                error={error.who}
                                helperText={error.who? "Выберите выполняющего" : ""}
                                label="Кто выполнял"
                                variant="outlined"
                                size='small'
                                title='Выбрать того кто раздавал права'
                                />
                            )}
                        />
                    </FormControl>
                </Box>
                <TextField
                    sx={{marginTop:2}}
                    id="descrip"
                    label="Описание"
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
            }}>Отмена</Button>
        <Button
          title="Отправить запрос на сервер"
          onClick={async () => {    
            const hasErr = Object.values(error).some((value) => value === true);
            if (hasErr || selectedSotrudniki.length === 0 || pto.length === 0 || obosnovanie.length === 0 || user.length === 0) {
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