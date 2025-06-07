import { useSubject, useCompany, useContract } from '../../websocket/WebSocketContext.jsx'
import {
    Button, 
    Typography, 
    TextField, 
    Box, 
    InputAdornment, 
    Paper, 
    IconButton,
    AccordionSummary, 
    AccordionDetails, 
    Accordion,
    CircularProgress,
    Fade
} from '@mui/material'
import { useState, useMemo, useEffect, memo, useCallback } from 'react';
import MDataGrid from '../DataGrid/MDataGrid.jsx';
import { useTableActions } from '../../websocket/LayoutMessage.jsx';
import CloseIcon from '@mui/icons-material/Close';
import { useDialogs } from '@toolpad/core/useDialogs';
import DialogSubjectEdit from './DialogSubjectEdit.jsx';
import DialogCompany from './DialogCompany.jsx';
import DialogContract from './DialogContract.jsx';
import DialogFullAdd from './DialogFullAdd.jsx';
import DialogReport from './DialogReport.jsx';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DownloadIcon from '@mui/icons-material/Download';
import { useSetFocusAndText } from '../hooks/SetFocusAndText.jsx';

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

const Subject = memo(function Subject() {
    const { handleDeleteRowBD, handleAddInTable, handleEditRow } = useTableActions();
    const dialogs = useDialogs();
    const Subjects = useSubject()
    const Company = useCompany();
    const Contract = useContract();
    const conf = useMemo(() => ({ density: 'compact'}), []);
    const confContr = useMemo(() => ({density: 'compact', }), []);

    const [openDialog, setOpenDialog] = useState(false)

    const [searchSubj, setSearchSubj] = useState(``) //поле ввода фио textfield
    const [selectSubject, setSelectSubject] = useState(null) //обьект выбранное субьекта
    const [isSearching, setIsSearching] = useState(false) // состояние для отслеживания процесса поиска
    const [debouncedSearchSubj, setDebouncedSearchSubj] = useState('') // значение после задержки
    const [showAnull, setShowAnull] = useState(false) // состояние для отслеживания процесса поиска

    useSetFocusAndText(setSearchSubj, 'isearchSubj')
    
    // Эффект для debounce поискового запроса
    useEffect(() => {
        // Показываем индикатор загрузки, если длина поискового запроса >= 3
        if (searchSubj.length >= 2) {
            setIsSearching(true);
        }
        const timer = setTimeout(() => {
            setDebouncedSearchSubj(searchSubj);
            setIsSearching(false); // Скрываем индикатор после завершения debounce
        }, 500);
        
        return () => {
            clearTimeout(timer);
        };
    }, [searchSubj]);


    const filteredSubjects = useMemo(() => {
        if (!debouncedSearchSubj || debouncedSearchSubj.length < 3) return [];
        return Subjects.filter((subj) =>
          subj?.name.toLowerCase().includes(debouncedSearchSubj.toLowerCase())
        );
    }, [Subjects, debouncedSearchSubj]);

    // скрытие окна субьектов при открытии диалогового окна редактирования контрактов
    async function openEditRowDialog(id,oldData,collectionName) {
        setOpenDialog(true)
        try {
            await handleEditRow(id,oldData,collectionName,DialogContract)
        } catch (error) {
            console.error("Ошибка при редактировании:", error)
        } finally {
            setOpenDialog(false)
        }
    }

    // скрытие окна субьектов при открытии диалогового окна редактирования контрактов
    async function openAddRowDialog() {
        if (!selectSubject) {dialogs.alert(`Выберите человека для добавления контракта`); return}
        setOpenDialog(true)
        await handleAddInTable(`Contract`,DialogContract, selectSubject)
        setOpenDialog(false)
    }
    const handleFilterSubjects = useCallback((value) => {
        setSearchSubj(value);
    }, []);

    // очистка фильтра
    function handleClearFilter(){
        setSearchSubj('');
        setSelectSubject(null)
    }

    // получение списка контрактов выбранного субьекта
    const getSubjectContracts = useCallback((sbj) => {
        setSelectSubject(sbj);
    }, []);


    const columnsContract = useMemo(()=>
        [
            { field: 'certif', headerName: 'Сертификат', flex:0.5,},
            { field: '_com', headerName: 'Компания', flex:1,
                valueGetter: (params) => params?.name || ''
            },
            { field: '_subj', headerName: 'ФИО', flex:1,
                valueGetter: (params) => params?.name || ''
            },
            { field: 'data_cert', headerName: 'Дата серт.',width:`95`, maxWidth:'96',
                type: 'date',
                valueGetter: (params) => {
                    if (!params) return null;
                    const date = dayjs(params);
                    return date.isValid() ? date.toDate() : null;
                },
                renderCell: (params) => {
                    if (params.value) {
                        return dayjs(params.value).format('DD.MM.YYYY');
                    }
                    return null;
                },
            },
            { field: 'data_contr', headerName: 'Дата контр.',width:`95`,maxWidth:'96',
                type: 'date',
                valueGetter: (params) => {
                    if (!params) return null;
                    const date = dayjs(params);
                    return date.isValid() ? date.toDate() : null;
                  },
                  renderCell: (params) => {
                    if (params.value) {
                      return dayjs(params.value).format('YYYY') === '2999' ? 'Бессрочный' :dayjs(params.value).format('DD.MM.YYYY');
                    }
                    return null;
                  },
            },
            { field: 'data_dover', headerName: 'Дата довер.',width:`95`, maxWidth:'96',
                type: 'date',
                valueGetter: (params) => {
                    if (!params) return null;
                    const date = dayjs(params);
                    return date.isValid() ? date.toDate() : null;
                  },
                  renderCell: (params) => {
                    if (params.value) {
                      return dayjs(params.value).format('YYYY') === '2999' ? 'Бессрочный' :dayjs(params.value).format('DD.MM.YYYY');
                    }
                    return null;
                  },
            },
            { field: 'data_zakl', headerName: 'Дата рег.',width:`95`, maxWidth:'96',
                type: 'date',
                valueGetter: (params) => {
                    if (!params) return null;
                    const date = dayjs(params);
                    return date.isValid() ? date.toDate() : null;
                  },
                  renderCell: (params) => {
                    if (params.value) {
                      return dayjs(params.value).format('DD.MM.YYYY');
                    }
                    return null;
                  },
            },
            { field: 'prikaz', headerName: 'Приказ',width:`80`},
            { field: 'time_edit', headerName: 'Пос. изм.',width:`140`, 
                type: 'date',
                valueGetter: (params) => {
                    if (!params) return null;
                    const date = dayjs(params);
                    return date.isValid() ? date.toDate() : null;
                  },
                  renderCell: (params) => {
                    if (params.value) {
                      return dayjs(params.value).format('DD.MM.YYYY HH:mm');
                    }
                    return null;
                  },
            }, 
            { field: '_who', headerName: 'Кто доб.',  width:`80`,
                valueGetter: (params) => params?.name || ''
            }, 
            { field: 'descrip', headerName: 'Описание', width: `20`,},
        ],[]
    ) 

    const columnsCompany = useMemo(()=>
        [
            { field: 'name', headerName: 'Наименование',flex:0.7},
            { field: 'unp', headerName: 'УНП',flex:0.2},
            { field: 'data_dob', headerName: 'Дата доб.',flex:0.25,
                type: 'date',
                valueGetter: (params) => {
                    if (!params) return null;
                    const date = dayjs(params);
                    return date.isValid() ? date.toDate() : null;
                  },
                  renderCell: (params) => {
                    if (params.value) {
                      return dayjs(params.value).format('DD.MM.YYYY HH:mm');
                    }
                    return null;
                  },
            }, 
            { field: '_who', headerName: 'Кто доб.',  flex:0.2,
                valueGetter: (params) => params?.name || ''
            }, 
            { field: 'descrip', headerName: 'Описание', width: 150, flex:0.12, },
        ],[]
    ) 

    // сортировка контрактов по времени изменения и по выбранному человеку
    const filteredContracts = useMemo(() => {
        const contractsToFilter = showAnull ? Contract.filter(el=>el.anull) : Contract;
        if (selectSubject?._id) {
            return contractsToFilter
                .filter(el => el._subj._id === selectSubject._id)
                .sort((a, b) => dayjs(b.time_edit).valueOf() - dayjs(a.time_edit).valueOf());
        }
        // Если субъект не выбран, показываем все, отсортированные по time_edit по убыванию
        return contractsToFilter.sort((a, b) => dayjs(b.time_edit).valueOf() - dayjs(a.time_edit).valueOf());
    }, [Contract, selectSubject?._id, showAnull]);

    // слот в ДатаГрид для отображение информации
    const colorInfoSlot = (
        <>
            <Box sx={{display:`flex`, justifyContent:`space-between`, alignItems:`center`, gap:1, mr:1}}>
                <Box sx={{width:'20px', height:'20px', backgroundColor:'subjectAnull.main', borderRadius:'3px'}}></Box>
                <Typography color='gray'>- аннулированные сертификаты</Typography>
            </Box>
            <Box sx={{display:`flex`, justifyContent:`space-between`, alignItems:`center`, gap:1}}>
                <Box sx={{width:'20px', height:'20px', backgroundColor:'subjectCertEnd.main', borderRadius:'3px'}}></Box>
                <Typography color='gray'>- истекшие сертификаты</Typography>
            </Box>
        </>
    )

    return (
        <div className='animated-element' style={{height:`100%`, maxWidth:`100vw`, width:`100%`, overflow:'hidden', position:'relative'}}>
            {/* меню управления */}
            {!openDialog &&  
            <>
            <Box sx={{display:`flex`, alignItems:`center`, gap:1, margin:`5px 0`}}>
               <Box sx={{width:`270px`,display:`flex`, alignItems:`center`, gap:1}}>
                <TextField
                        id="isearchSubj"
                        label="ФИО"
                        size='small'
                        value={searchSubj}
                        onKeyDown={(event)=>{
                            if (event.key === 'Escape') {
                                handleClearFilter();
                            }}
                        }
                        onChange={(event)=>{handleFilterSubjects(event.target.value)}}
                        slotProps={{
                            input: {
                                endAdornment: (
                                <InputAdornment position="end">
                                    {isSearching ? (
                                        <CircularProgress size={20} />
                                    ) : searchSubj ? (
                                        <IconButton onClick={()=>handleClearFilter()}>
                                            <CloseIcon/>
                                        </IconButton>
                                    ) : null}
                                </InputAdornment>
                                ),
                            },
                        }}
                    />
                    <Button 
                        variant='contained' 
                        title='Редактировать список субъектов' 
                        onClick={async ()=>await dialogs.open(DialogSubjectEdit)}
                    >доб.</Button>
               </Box>
               <Box sx={{display:`flex`, justifyContent:`space-between`, alignItems:`center`, flex:`1`}}>
                    <Box sx={{display:`flex`}}>Контракты<Typography color='primary.main'>: {selectSubject && selectSubject.name}</Typography></Box>
                    <Box sx={{display:`flex`,alignItems:`center`, gap:1}}>
                        <Button variant='text' title='Загрузить ежедневный отчет' onClick={async ()=>await dialogs.open(DialogReport)}>
                        отчет <DownloadIcon></DownloadIcon></Button>
                        <Button variant='outlined' title='Добавить Субьекта и Компанию сразу' onClick={async ()=>await dialogs.open(DialogFullAdd)}>
                        полное добавление</Button>
                        <Button variant={showAnull ? 'contained' : 'outlined'} title='Просмотреть аннул. сертификаты (вкл\выкл)' onClick={()=>{setShowAnull((prev)=>!prev)}}>
                        аннул.</Button>
                        <Button variant='outlined' title='Просмотреть ВСЕ контракты' onClick={()=>{handleClearFilter(); setShowAnull(false)}}>
                        ВСЕ</Button>
                    </Box>
               </Box>
            </Box>

            <Box sx={{display:`flex`, gap:1}}>
                {/* столбец с субьектами */}
                <Paper variant='elevation' elevation={1} 
                    sx={{
                        width:`270px`, 
                        display:`flex`, 
                        flexDirection:`column`, 
                        padding:`4px`, gap:1, 
                        maxHeight:`700px`,
                        overflowY:`auto`,
                    }}>
                    {filteredSubjects.map(sbj=>{
                        return (
                            <Fade 
                                key={sbj._id} 
                                in={true} 
                                timeout={300} 
                                style={{ transitionDelay: `300ms` }}
                            >
                            <Box key={sbj._id} sx={{display:`flex`, flexDirection:`column`}}>
                                <Button  variant={selectSubject && sbj._id === selectSubject._id ? `contained` : `outlined`} sx={{display:`flex`, flexDirection:`column`, fontSize:`11px`}} onClick={()=>getSubjectContracts(sbj)}>
                                    {sbj.name}
                                    <Box color={`GrayText`} sx={{display:`flex`, justifyContent:`space-between`, padding:`0 3px`}}>
                                        <Typography variant='caption'>{dayjs(new Date(sbj.data_dob)).format(`DD.MM.YYYY`)}-</Typography>
                                        <Typography variant='caption'>{sbj._who.name}</Typography>
                                    </Box>
                                </Button>                          
                            </Box>
                            </Fade>
                        )
                    })}
                    {searchSubj.length < 1 ? <Typography color='gray' 
                    sx={{justifyContent:'center', margin:'auto 0', textShadow: '10px 10px 10px rgb(10, 9, 9)'}}>
                        Просто начните вводить ФИО <br /> для поиска...</Typography> : undefined}
                </Paper>

                {/* столбец с данными таблицы контрактов и компаний*/}
                <Box sx={{flex:1, display:`flex`, flexDirection:`column`, gap:1}}>
                    <Paper variant='elevation' elevation={1} sx={{ overflow:`hidden`, height:'100%', maxWidth:'1270px'}}>
                        <MDataGrid 
                            conf={confContr}
                            tableData={filteredContracts}
                            columns={columnsContract} 
                            collectionName={`Contract`} 
                            actionEdit={(id,oldData,collectionName)=>openEditRowDialog(id,oldData,collectionName)}
                            actionDelete={handleDeleteRowBD}
                            actionAdd={openAddRowDialog}
                            topSlot={colorInfoSlot}
                        />
                    </Paper>
                    {/* список компаний */}
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1-content"
                            id="com-accordion"
                            sx={{backgroundColor:'#9c92921d'}}
                        >
                            <Typography color='primary.main' component="span">Список компаний (редактирование, добавление)</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ overflow: 'auto', display: 'block', minHeight:`520px` }}>
                            <Paper variant='elevation' elevation={1} sx={{minHeight:`361px`}}>
                                <MDataGrid 
                                    conf={conf}
                                    tableData={Company.sort((a, b) => dayjs(b.data_dob).valueOf() - dayjs(a.data_dob).valueOf())}
                                    columns={columnsCompany} 
                                    collectionName={`Company`} 
                                    actionEdit={(id,oldData,collectionName)=>handleEditRow(id,oldData,collectionName,DialogCompany)}
                                    actionDelete={handleDeleteRowBD}
                                    actionAdd={()=>handleAddInTable(`Company`,DialogCompany)}
                                />
                            </Paper>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </Box>
            </>}
        </div>
    )
})
export default Subject