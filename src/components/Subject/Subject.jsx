import { useSubject, useContract } from '../../websocket/WebSocketContext.jsx'
import {
    Button, 
    Typography, 
    Box, 
    Paper, 
} from '@mui/material'
import { useState, useMemo, memo, useCallback } from 'react';
import MDataGrid from '../DataGrid/MDataGrid.jsx';
import { useTableActions } from '../../websocket/LayoutMessage.jsx';
import { useDialogs } from '@toolpad/core/useDialogs';
import DialogContract from './DialogContract.jsx';
import DialogFullAdd from './DialogFullAdd.jsx';
import DialogReport from './DialogReport.jsx';
import DownloadIcon from '@mui/icons-material/Download';
import SubjectListMenu from './SubjectUtils/SubjectListMenu.jsx';
import SearchSubjectInput from './SubjectUtils/SearchSubjectInput.jsx'; 
import CompanyAccordion from './SubjectUtils/CompanyAccordion.jsx';

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

const Subject = memo(function Subject() {
    const { handleDeleteRowBD, handleAddInTable, handleEditRow } = useTableActions();
    const dialogs = useDialogs();
    const Subjects = useSubject()
    const Contract = useContract();
    const confContr = useMemo(() => ({density: 'compact', }), []);

    const [openDialog, setOpenDialog] = useState(false)

    const [selectSubject, setSelectSubject] = useState(null) //обьект выбранное субьекта
    const [debouncedSearchSubj, setDebouncedSearchSubj] = useState('') // новое состояние для дебаунснутого значения
    const [showAnull, setShowAnull] = useState(false)

    const handleDebouncedSearchChange = useCallback((value) => {
        setDebouncedSearchSubj(value);
    }, []);

    const filteredSubjects = useMemo(() => {
        if (!debouncedSearchSubj || debouncedSearchSubj.length < 3) return [];
        return Subjects.filter((subj) =>
          subj?.name.toLowerCase().includes(debouncedSearchSubj.toLowerCase())
        );
    }, [Subjects, debouncedSearchSubj]);

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

    async function openAddRowDialog() {
        if (!selectSubject) {dialogs.alert(`Выберите человека для добавления контракта`); return}
        setOpenDialog(true)
        await handleAddInTable(`Contract`,DialogContract, selectSubject)
        setOpenDialog(false)
    }

    const handleClearFilter = () => {
        setDebouncedSearchSubj('');
        setSelectSubject(null)
    }

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

    const filteredContracts = useMemo(() => {
        const contractsToFilter = showAnull ? Contract.filter(el=>el.anull) : Contract;
        if (selectSubject?._id) {
            return contractsToFilter
                .filter(el => el._subj._id === selectSubject._id)
                .sort((a, b) => dayjs(b.time_edit).valueOf() - dayjs(a.time_edit).valueOf());
        }
        // Если субъект не выбран, показываем все, отсортированные по time_edit по убыванию
        return contractsToFilter.sort((a, b) => dayjs(b.time_edit).valueOf() - dayjs(a.time_edit).valueOf());
    }, [Contract, selectSubject, showAnull]);

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
            {!openDialog &&  
            <>
            <Box sx={{display:`flex`, alignItems:`center`, gap:1, margin:`5px 0`}}>
               <SearchSubjectInput 
                    onDebouncedSearchChange={handleDebouncedSearchChange}
                    initialSearchValue={debouncedSearchSubj}
                    handleClearFilter={handleClearFilter}
               />
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

            <Box sx={{display:`flex`, gap:1, mb:1}}>
                <SubjectListMenu 
                    selectSubject={selectSubject}
                    getSubjectContracts={getSubjectContracts}
                    filteredSubjects={filteredSubjects}
                    searchSubj={debouncedSearchSubj}
                />
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
                </Box>
            </Box>
            <CompanyAccordion/>
            </>}
        </div>
    )
})
export default Subject