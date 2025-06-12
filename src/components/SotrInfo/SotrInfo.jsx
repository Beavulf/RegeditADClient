import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
    TextField, 
    Box, 
    Typography, 
    FormControl, 
    Autocomplete,
    Button,
    IconButton
} from '@mui/material';
import { 
    useSotrudnik, 
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
import Collapse from '@mui/material/Collapse';
import ExportExcel from './LoadToExcel.jsx';
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
import api from '../../apiAxios/Api.jsx';
import { useDialogs } from '@toolpad/core';
import DialogExcel from './DialogExcel.jsx';
import SimCardDownloadIcon from '@mui/icons-material/SimCardDownload';

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
import isBetween from 'dayjs/plugin/isBetween'
dayjs.locale('ru');
dayjs.extend(isBetween);

const SERVER_ADDRESS = import.meta.env.VITE_SERVER_ADDRESS
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT

// списоу кнопок выбора данных ADTool
const BTN_LIST_ADTOOL = [
    'Отпуск',
    'Учеба',
    'Стажировка',
    'Командировка',
    'Соц. отпуск',
    'Декрет',
    'Продление отп.',
]

export default function SotrInfo() {
    const Sotrudnik = useSotrudnik()
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
    const dialogs = useDialogs();

    // Получаем функцию экспорта из LoadToExcel
    const exportToExcel = ExportExcel();

    const [pdokaData, setPdokaData] = useState([]) //для хранения всех записей из таблицы ДокаНАСТД
    const [selectedSotrudnik, setSelectedSotrudnik] = useState({}) // выбранный сотрудник
    const [selectedTable, setSelectedTable] = useState(null) // выбранная таблица, содержит данные и столбцы
    const [activeBtn, setActiveBtn] = useState(null) //активная кнопка таблицы после клика
    const [columnsSelectedTable, setColumnsSelectedTable] = useState([]) // столбцы выбранной таблицы
    const [activeFromADToolBtn, setActiveFromADToolBtn] = useState(null) // активная кнопка из ADTool
    const [currentAction, setCurrentAction] = useState('') // текущее состояние сотрудника
    const [isLoading, setIsLoading] = useState(false) // идет ли загрузка данных
    const [openExcelDialog, setOpenExcelDialog] = useState(false); // Состояние для открытия/закрытия диалога Excel
    const [excelExportData, setExcelExportData] = useState({ data: [], tableName: '' }); // Данные для экспорта в Excel

    // список основных кнопки правого меню, с привязанными к ним данными и столбцами
    const listTableBtn = useMemo(() => ({
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
        'Дока НАСТД' : {data: pdokaData, columns: colPdoka},
        'Данные из ADTool' : {data: ADTool, columns: colADTool},
    }), [pdokaData, Priem, Uvolnenie, Naznachenie, SbrosAD, Perevod, VPerevod, Familia, Zapros, Svodka, Revizor, Chdti, Aipsin, Stajirovka, ADTool])
    

    // мемомизация фильтрация таблицы
    const filteredData = useMemo(() => {   
        if (!selectedTable || !selectedSotrudnik) return [];
        let filtered = [];
        if (activeBtn === 'Данные из ADTool') {
            if (activeFromADToolBtn) {
                filtered = selectedTable.filter(el => (el.fio === selectedSotrudnik.fio) && (el.descriptions === activeFromADToolBtn)).sort((a, b) => new Date(b.date_z) - new Date(a.date_z));
            } else {
                filtered = selectedTable.filter(el => el.fio === selectedSotrudnik.fio).sort((a, b) => new Date(b.date_z) - new Date(a.date_z));
            }
        } else {
            filtered = selectedTable.filter(el => el._sotr?._id === selectedSotrudnik._id);
        }
        //сортируем - новейшие сверху
        if (filtered.length > 0 && filtered[0].data_dob) {
            filtered.sort((a, b) => new Date(b.data_dob) - new Date(a.data_dob));
        }
        return filtered;
    }, [selectedTable, selectedSotrudnik, activeBtn, activeFromADToolBtn]);

    // при клике по кнопке выбора таблицы или загрузка всех данных Дока НАСТД если выбрана эта таблица
    const handleSelectTable = async (tableName) => {
        setIsLoading(true);
        if (tableName === 'Дока НАСТД') {
            const data = await getAllPdokaData();
            setPdokaData(data);
            setColumnsSelectedTable(listTableBtn[tableName].columns);
            setSelectedTable(data);
        } else {
            setColumnsSelectedTable(listTableBtn[tableName].columns);
            setSelectedTable(listTableBtn[tableName].data);
        }
        setIsLoading(false);
        setActiveBtn(tableName);      
    }
    // выбор активной кнопки сортировки данных ADTool
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

    //получение самого последнего значения из таблицы по выбранной дате
    function getMostRecent (data, sotrId, dataKey) {
        return data
        .filter(el => el._sotr && el._sotr._id === sotrId)
        .reduce((mostRecent, current)=>{
            const currentDate = dayjs(current[dataKey])
            const mostRecentDate = mostRecent ? dayjs(mostRecent[dataKey]) : null
            return !mostRecent || currentDate.isAfter(mostRecentDate) ? current : mostRecent
        },null)
    } 

    // получение текущего состояния сотрудника (уволен ли, на стажировке, переведен временно)
    const getCurrentAction = useCallback(() =>{
        try {
            let action = ''
            setCurrentAction('');
            if (!selectedSotrudnik) {
                setCurrentAction('');
                return;
            }

            const mostRecentUvol = getMostRecent(Uvolnenie, selectedSotrudnik._id, 'data_uvol');
            if (mostRecentUvol && mostRecentUvol.data_uvol) {
                action = `Уволен ${dayjs(mostRecentUvol.data_uvol).format('DD MMM YYYY')}`
                setCurrentAction(action);
                return;
            } 
            const mostRecentVperevod = getMostRecent(VPerevod, selectedSotrudnik._id, 'data_k');
            if (mostRecentVperevod && mostRecentVperevod.data_n) {
                const startDate = dayjs(mostRecentVperevod.data_n);
                const endDate = dayjs(mostRecentVperevod.data_k);
                if (dayjs().isBetween(startDate, endDate, 'day', '[]')) {
                    action = `Временно переведен с ${startDate.format('DD.MM.YYYY')} по ${endDate.format('DD.MM.YYYY')} в ${mostRecentVperevod._kyda.name}`
                    setCurrentAction(action);
                }
                return;
            }
            const mostRecentStajirovka = getMostRecent(Stajirovka, selectedSotrudnik._id, 'data_k');
            if (mostRecentStajirovka && mostRecentStajirovka.data_n) {
                const startDate = dayjs(mostRecentStajirovka.data_n);
                const endDate = dayjs(mostRecentStajirovka.data_k);
                if (dayjs().isBetween(startDate, endDate, 'day', '[]')) {
                    action = `На стажировке с ${startDate.format('DD.MM.YYYY')} по ${endDate.format('DD.MM.YYYY')} в ${mostRecentStajirovka._kyda.name}`
                    setCurrentAction(action);
                }
                return;
            }
            setCurrentAction('Служит родине');
        }
        catch {
            setCurrentAction(`Ошибка получения информации.`);
        }
    },[selectedSotrudnik, Uvolnenie, VPerevod, Stajirovka])

    // для получение текущего состояния сотрудника
    useEffect(() => {
        if (selectedSotrudnik && selectedSotrudnik._id) {
            getCurrentAction();
        } else {
            setCurrentAction('');
        }
    }, [selectedSotrudnik, getCurrentAction]);

    // функция получения всех записей таблтицы прав Доки и НАСТД через запрос сервера
    const getAllPdokaData = async () => {
        try {
            const response = await api.get(`http://${SERVER_ADDRESS}:${SERVER_PORT}/allpdoka`)
            if (response.status !== 200) {
                const errorText = await response.text();
                console.error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                dialogs.alert(`Ошибка запроса данных у сервера: ${response.status} - ${errorText}`);
                return null;
            }
 
            const data = await response.data;

            if (!data || data.length === 0) {
                console.warn("Получен пустой ответ от сервера");
                return [];
            }

            return data;   
        } catch (error) {
            dialogs.alert(`Ошибка запросе данных у сервера: ${error.message}`);
        }
    }
    
    // функция обработки экспорта
    const handleExportExcel = (filteredData) => {
        exportToExcel(filteredData, excelExportData.tableName); // Вызываем функцию экспорта
        handleCloseExcelDialog();
    };

    // функция открытия диалога Excel
    const handleOpenExcelDialog = (data, tableName) => {
        setExcelExportData({ data, tableName });
        setOpenExcelDialog(true);
    };

    const handleCloseExcelDialog = () => {
        setOpenExcelDialog(false);
    };

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
                        <Typography variant='h5' sx={{display:'flex', gap:1,}}>
                            <Box>
                                {selectedSotrudnik.fio} ({selectedSotrudnik.login})  
                            </Box>|
                        </Typography>
                        <Typography variant='h6' sx={{display:'flex', gap:1, ml:1}}>
                            <Box color='gray'>{selectedSotrudnik?.lnp || 'нет'} - {selectedSotrudnik?._otdel?.name}</Box> |
                        </Typography>
                        <Typography variant='h6' sx={{display:'flex', gap:1, ml:1}}>
                            <Box color='primary.main'>{currentAction}</Box> |
                        </Typography>
                        <Typography variant='h6' sx={{display:'flex', gap:1, ml:1}}>
                            <Box color='darkGray'>{selectedSotrudnik.descrip}</Box>
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
                    loading={isLoading}
                />
                {/* кнопки выбора данных из ADTool */}
                <Collapse orientation="horizontal" in={activeBtn === 'Данные из ADTool'}>
                    <Box 
                        sx={{display:'flex', flexDirection:'column', width:'200px', height:'100%', borderTop:'3px solid', borderColor:'primary.main', }}
                    >
                        {BTN_LIST_ADTOOL.map(btn=>
                            (<Button 
                                key={btn} 
                                variant={activeFromADToolBtn === btn ? 'contained' : 'text'}
                                onClick={()=>handleSelectActiveADToolBtn(btn)} 
                                sx={{...styleADToolBtn}}
                            >{btn}</Button>)
                        )}
                        {/* загрузка в эксель данных из ADTool, выбранных */}
                        <Typography sx={{mt:2, color:'gray'}}>
                            {activeFromADToolBtn || 'Всё'}
                            <IconButton 
                                title='Загрузить файл' 
                                color='info' 
                                onClick={() => handleOpenExcelDialog(filteredData, 'Данные из ADTool')}
                                sx={{
                                    color:'primary.main', 
                                    '&:focus' : {
                                        outline: 'none'
                                    },
                                }}
                            >
                                <SimCardDownloadIcon/>
                            </IconButton>
                        </Typography>
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
                        <Box key={tableName} sx={{display:'flex'}}>
                            <Button 
                                key={tableName}
                                fullWidth 
                                variant={activeBtn === tableName ? 'contained' : 'text'} 
                                color='primary'
                                size='large' 
                                onClick={()=>handleSelectTable(tableName)}
                                sx={{
                                    flex:1,
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
                                    transition: 'ease 0.3s width'
                                }}  
                            >{tableName}</Button>
                            {tableName === activeBtn ? (
                                <IconButton 
                                    title='Загрузить файл' 
                                    color='info' 
                                    onClick={() => handleOpenExcelDialog(filteredData, tableName)}
                                    sx={{
                                        color:'primary.main', 
                                        '&:focus' : {
                                            outline: 'none'
                                        },
                                    }}
                                >
                                    <SimCardDownloadIcon/>
                                </IconButton>
                            ) : null}
                            
                        </Box>
                    ))}
                </Box>
            </Box>
            <DialogExcel
                open={openExcelDialog}
                onClose={handleCloseExcelDialog}
                data={excelExportData.data}
                tableName={excelExportData.tableName}
                onExport={handleExportExcel}
            />
        </Box>
    )
}