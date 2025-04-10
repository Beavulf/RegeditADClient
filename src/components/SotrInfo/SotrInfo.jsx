import { useState, useMemo, useEffect } from 'react';
import { 
    TextField, 
    Box, 
    Typography, 
    FormControl, 
    Autocomplete,
    Button 
} from '@mui/material';
import { 
    useSotrudnik, 
    usePdoka,
    usePriem,
    useSbrosAD,
    useNaznachenie,
    usePerevod,
    useVPerevod,
    useFamilia,
    useUvolnenie,
    useZapros,
    useSvodka,
    useRevizor,
    useChdti,
    useAipsin,
    useStajirovka,
    useAdtool

} from '../../websocket/WebSocketContext.jsx'
import Grow from '@mui/material/Grow';
import SotrInfoDataGrid from './SotrDataGrid.jsx';
import { 
    colNaznachenie,
    colPdoka,
    colPriem,
    colSbrosAD,
    colPerevod,
    colVPerevod,
    colFamilia,
    colUvolnenie,
    colZapros,
    colSvodka,
    colRevizor,
    colAipsin,
    colStajirovka,
    colADTool,
    colChdti

} from './TableColumns.jsx';
import Collapse from '@mui/material/Collapse';

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

export default function SotrInfo() {
    const Sotrudnik = useSotrudnik()
    const Pdoka = usePdoka()
    const Priem = usePriem()
    const SbrosAD = useSbrosAD()
    const Perevod = usePerevod()
    const VPerevod = useVPerevod()
    const Familia = useFamilia()
    const Uvolnenie = useUvolnenie()
    const Zapros = useZapros()
    const Svodka = useSvodka()
    const Revizor = useRevizor()
    const Chdti = useChdti()
    const Aipsin = useAipsin()
    const Stajirovka = useStajirovka()
    const Naznachenie = useNaznachenie()
    const ADTool = useAdtool()
    // объект искомого сотрудника
    const [selectedSotrudnik, setSelectedSotrudnik] = useState('') // выбранный сотрудник
    const [selectedTable, setSelectedTable] = useState(null) // выбранная таблица, содержит данные и столбцы
    const [activeBtn, setActiveBtn] = useState(null) //выбранная кнопка таблицы
    const [columnsSelectedTable, setColumnsSelectedTable] = useState([]) // столбцы выбранной таблицы
    const [activeFromADToolBtn, setActiveFromADToolBtn] = useState(null)
    const [currentAction, setCurrentAction] = useState('')
    // основные кнопки правого меню
    const listTableBtn = {
        'Прием на работу' : {data: Priem, columns: colPriem},
        'Увольнение' : {data: Uvolnenie, columns: colUvolnenie},
        'Назначение' : {data: Naznachenie, columns: colNaznachenie},
        'Сброс пароля AD' : {data: SbrosAD, columns: colSbrosAD},
        'Перевод' : {data: Perevod, columns: colPerevod},
        'Временный перевод' : {data: VPerevod, columns: colVPerevod},
        'Изменение фамилии' : {data: Familia, columns: colFamilia},
        'Запрос' : {data: Zapros, columns: colZapros},
        'Сводка' : {data: Svodka, columns: colSvodka},
        'Ревизор' : {data: Revizor, columns: colRevizor},
        'ЦХДТИ' : {data: Chdti, columns: colChdti},
        'Аиспин' : {data: Aipsin, columns: colAipsin},
        'Стажировка' : {data: Stajirovka, columns: colStajirovka},
        'Дока НАСТД' : {data: Pdoka, columns: colPdoka},
        'Данные из ADTool' : {data: ADTool, columns: colADTool},
    }
    // кнопки выбора данных ADTool
    const listADToolBtn = [
        'Отпуск',
        'Учеба',
        'Стажировка',
        'Командировка',
        'Соц. отпуск',
        'Декрет',
        'Продление отп.',
    ]
    // мемомизация фильтрация таблицы
    const filteredData = useMemo(() => {   
        if (!selectedTable || !selectedSotrudnik) return [];
        if (activeBtn === 'Данные из ADTool') {
            if (activeFromADToolBtn) return selectedTable.filter(el => (el.fio === selectedSotrudnik.fio) && (el.descriptions === activeFromADToolBtn));
            return selectedTable.filter(el => el.fio === selectedSotrudnik.fio);
        }
        return selectedTable.filter(el => el._sotr?._id === selectedSotrudnik._id);
    }, [selectedTable, selectedSotrudnik, activeBtn, activeFromADToolBtn]);

    // при клике по кнопке выбора таблицы
    const handleSelectTable = (tableName) => {
        setColumnsSelectedTable(listTableBtn[tableName].columns)
        setSelectedTable(listTableBtn[tableName].data);
        setActiveBtn(tableName)        
    }
    // активная кнопка данных из ADTool
    const handleSelectActiveADToolBtn = (id) => {
        setActiveFromADToolBtn(id)
    }
    // закрыть меню кнопок ADTool
    const handleBackToMainBtn = () => {
        setActiveFromADToolBtn(null)
        setActiveBtn('back')
    }
    // выделенные стили для кнопок
    const styleADToolBtn = {
        boxShadow:'none' ,
        '&:focus' : {
            outline: 'none'
        },
        '&:hover': {
            boxShadow: 'none',
        },
        borderTopRightRadius: '0px',
        borderBottomRightRadius: '0px',
        borderTopLeftRadius: '0px',
        borderBottomLeftRadius: '0px',
    }

    useEffect(() => {
        if (selectedSotrudnik && selectedSotrudnik._id) {
            getCurrentAction();
        } else {
            setCurrentAction('');
        }
    }, [selectedSotrudnik]);

    // получение текущего состояния сотрудника (уволен ли, на тсажировке, переведен временно)
    function getCurrentAction() {
        setCurrentAction('');
        if (!selectedSotrudnik) {
            setCurrentAction('');
            return;
        }
        const uvolList = Uvolnenie.filter(el => el._sotr && el._sotr._id === selectedSotrudnik._id)
            .sort((a, b) =>  new Date(b.data_dob) - new Date(a.data_dob));
        if (uvolList.length > 0 && uvolList[0].data_uvol) {
            setCurrentAction(`Уволен ${dayjs(uvolList[0].data_uvol).format('DD MMM YYYY')}`);
            return;
        } 
        const vperevodList = VPerevod.filter(el => el._sotr && el._sotr._id === selectedSotrudnik._id)
            .sort((a, b) =>  new Date(b.data_k) - new Date(a.data_k));
        if (vperevodList.length > 0 && vperevodList[0].data_n) {
            const today = dayjs();
            const startDate = dayjs(vperevodList[0].data_n);
            const endDate = dayjs(vperevodList[0].data_k);
            if (today.isAfter(startDate) && today.isBefore(endDate) || today.isSame(startDate) || today.isSame(endDate)) {
                setCurrentAction(`Временно переведен с ${startDate.format('DD.MM.YYYY')} по ${endDate.format('DD.MM.YYYY')} в ${vperevodList[0]._kyda.name}`);
            }
            return;
        }
        const stajirovkaList = Stajirovka.filter(el => el._sotr && el._sotr._id === selectedSotrudnik._id)
            .sort((a, b) =>  new Date(b.data_k) - new Date(a.data_k));
        if (stajirovkaList.length > 0 && stajirovkaList[0].data_n) {
            const today = dayjs();
            const startDate = dayjs(stajirovkaList[0].data_n);
            const endDate = dayjs(stajirovkaList[0].data_k);
            if (today.isAfter(startDate) && today.isBefore(endDate) || today.isSame(startDate) || today.isSame(endDate)) {
                setCurrentAction(`На стажировке с ${startDate.format('DD.MM.YYYY')} по ${endDate.format('DD.MM.YYYY')} в ${stajirovkaList[0]._kyda.name}`);
            }
            return;
        }
    }

    return (
        <Box sx={{display:'flex', flexDirection:'column', height:'80vh', overflow:'hidden'}}>

            {/* строка поиска */}
            <Box sx={{display:'flex', alignItems:'center',}}>
                <FormControl fullWidth>
                    <Autocomplete
                        id="selectSotrudnik"
                        value={Sotrudnik.find(o => o._id === selectedSotrudnik._id) || null}
                        onChange={(event, newValue) => {setSelectedSotrudnik(newValue ? newValue : '');}}
                        onInputChange={(event, value) => {
                            // Фильтруем варианты по введенному значению
                            const filteredOptions = Sotrudnik.filter(option => 
                                option.fio.toLowerCase().includes(value.toLowerCase()) ||
                                String(option.lnp).includes(value)
                            );

                            // Если после фильтрации остался только один вариант, автоматически выбираем его
                            if (filteredOptions.length === 1) {
                                setSelectedSotrudnik(filteredOptions[0]);
                                event?.target?.blur();
                            }
                        }}
                        options={Sotrudnik}
                        getOptionLabel={(option) => `${option.fio} (${option.lnp})`}
                        isOptionEqualToValue={(option, value) => option._id === value?._id}
                        title='Поиск сотрудника'
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Поиск сотрудника"
                                variant="standard"
                                size='small'
                            />
                        )}
                    />
                </FormControl>
            </Box>

            {/* инфо сотрудника */}
            <Box sx={{display:'flex',}}>
                <Grow in={selectedSotrudnik && true || false}>
                    <Box sx={{display:'flex', alignItems:'center'}}>
                        <Typography variant='h5' sx={{display:'flex', gap:1}}>
                            {selectedSotrudnik.fio} (<Box color='gray'>{selectedSotrudnik.login}</Box>) | {selectedSotrudnik?.lnp || ' нет'} -
                            <Box color='gray'>{selectedSotrudnik?._otdel?.name}</Box> |
                        </Typography>
                        <Typography variant='h6' sx={{display:'flex', gap:1, ml:1}}>
                            {currentAction}
                        </Typography>
                    </Box>
                </Grow>
            </Box>

            {/* сборник таблиц */}
            <Box sx={{mt:2, display:'flex', flexDirection:'row', overflow:'hidden', flexGrow:1,}}>
                
                {/* отображение таблицы */}
                <SotrInfoDataGrid 
                    columns={columnsSelectedTable} 
                    data={filteredData}
                />

                {/* кнопки выбора данных из ADTool */}
                <Collapse orientation="horizontal" in={activeBtn === 'Данные из ADTool'}>
                    <Box 
                        sx={{display:'flex', flexDirection:'column', width:'200px', height:'100%', borderTop:'3px solid', borderColor:'primary.main', }}
                    >
                        {listADToolBtn.map(btn=>
                            (<Button 
                                key={btn} 
                                variant={activeFromADToolBtn === btn ? 'contained' : 'text'}
                                onClick={()=>handleSelectActiveADToolBtn(btn)} 
                                sx={{...styleADToolBtn}}
                            >{btn}</Button>)
                        )}
                        <Button sx={{...styleADToolBtn, marginTop:'auto'}} onClick={handleBackToMainBtn}>- Назад -</Button>
                    </Box>
                </Collapse>

                {/* прокладка */}
                <Box sx={{
                    m:0, 
                    bgcolor:selectedTable && 'primary.main', 
                    height:'100%', 
                    width:'10px', 
                    borderTop:'1px solid gray', 
                    borderBottom:'1px solid gray',
                    transition: 'background-color 0.3s ease',
                }}></Box>

                {/* кнопки выбора таблиц */}
                <Box sx={{width:'300px', 
                    borderTop: '1px solid gray',
                    borderRight: '1px solid gray',
                    borderBottom: '1px solid gray',
                    borderTopRightRadius: '5px',
                    borderBottomRightRadius: '5px',
                    overflow:'auto',
                }}>
                    {Object.keys(listTableBtn).map((tableName)=>(
                        <Button 
                            key={tableName}
                            fullWidth 
                            variant={activeBtn === tableName ? 'contained' : 'text'} 
                            color='primary'
                            size='large' 
                            onClick={()=>handleSelectTable(tableName)}
                            sx={{
                                boxShadow:'none' ,
                                '&:focus' : {
                                    outline: 'none'
                                },
                                '&:hover': {
                                    boxShadow: 'none',
                                },
                                borderTopRightRadius: '4px',
                                borderBottomRightRadius: '1px',
                                borderTopLeftRadius: '0px',
                                borderBottomLeftRadius: '0px',
                            }}  
                        >{tableName}</Button>
                    ))}
                </Box>
            </Box>
            
        </Box>
    )
}