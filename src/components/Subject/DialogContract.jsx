import MDataGrid from '../DataGrid/MDataGrid.jsx';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InfoIcon from '@mui/icons-material/Info';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { TextField, Box, Typography, Checkbox, IconButton } from '@mui/material';
import { useUsers, useCompany, useProdlenie, useContract } from '../../websocket/WebSocketContext.jsx'
import { useDialogs } from '@toolpad/core/useDialogs';
import { useTableActions } from '../../websocket/LayoutMessage.jsx';
import DialogProdlenie from './DialogProdlenie.jsx';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import getWhoId from '../users/GetWhoID.jsx';
import AnullContract from './UtilsDialogContract/AnullContract.jsx';
import CAutoCompleate from '../utils/CAutoCompleate.jsx'
import CircularProgress from '@mui/material/CircularProgress';

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
import { enqueueSnackbar } from 'notistack';
dayjs.locale('ru');

const columnsProdlenie =
  [
      { field: 'ndata_contr', headerName: 'Дата контр.',flex:0.25,
          type: 'date',
          valueGetter: (params) => {
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
      { field: 'ndata_dov', headerName: 'Дата дов.',flex:0.25,
          type: 'date',
          valueGetter: (params) => {
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
      { field: 'prikaz', headerName: 'Приказ',  flex:0.2}, 
      { field: 'data_prikaza', headerName: 'Дата прик.',flex:0.25,
          type: 'date',
          valueGetter: (params) => {
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
      { field: 'data_dob', headerName: 'Дата доб.',flex:0.25,
          type: 'date',
          valueGetter: (params) => {
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
      { field: '_who', headerName: 'Кто доб.',  width:`100`,
          valueGetter: (params) => params?.name || ''
      }, 
      { field: 'descrip', headerName: 'Описание', width: 150, flex:0.12, },
]

export default function DialogContract({ payload, open, onClose,  }) {
  const dialogs = useDialogs();
  const Users = useUsers()
  const Company = useCompany()
  const Prodlenie = useProdlenie()
  const Contract = useContract()
  const { handleDeleteRowBD, handleAddInTable } = useTableActions();

  //данные контракта
  const [subject, setSubject] = useState(``)
  const [certif, setCertif] = useState('');
  const [dateCertif, setDateCertif] = useState(dayjs(new Date())); 
  const [company, setCompany] = useState('');
  const [dateContr, setDateContr] = useState(dayjs(new Date()));
  const [dateDover, setDateDover] = useState(dayjs(new Date()));
  const [dateRegi, setDateRegi] = useState(dayjs(new Date()));
  const [prikaz, setPrikaz] = useState(``)
  const [timeEdit, setTimeEdit] = useState(null);
  const [editCertif, setEditCertif] = useState(false);
  const [originDateContr, setOriginDateContr] = useState(null);
  const [originDateDover, setOriginDateDover] = useState(null);

  const [prikazAnull, setPrikazAnull] = useState('')
  const [dateAnull, setDateAnull] = useState(dayjs(new Date()))

  const [dataDob, setDataDob] = useState(dayjs(new Date()))
  const [descrip, setDescrip] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Заполняем начальные данные при открытии окна
  useEffect(() => {     
    if (payload) {          
      if (payload.addcontext) {  
          setSubject(payload.addcontext._id);
      }
      else {      
        setPrikazAnull(payload.prikaz_anull || '');
        setDateAnull(dayjs(new Date(payload.data_anull)) || dayjs(new Date()).format('DD.MM.YYYY'));

        setCertif(payload.certif || '');
        setTimeEdit(dayjs(new Date(payload.time_edit)) || dayjs(new Date()).format('DD.MM.YYYY HH:mm'));
        setDateCertif(dayjs(new Date(payload.data_cert)) || dayjs(new Date()));
        setCompany(payload?._com?._id || '');
        setDateContr(dayjs(new Date(payload.data_contr)) || dayjs(new Date()));
        setDateDover(dayjs(new Date(payload.data_dover)) || dayjs(new Date()));
        setDateRegi(dayjs(new Date(payload.data_zakl)) || dayjs(new Date()));
        setPrikaz(payload.prikaz || '');
        setDataDob(dayjs(new Date(payload.data_dob)) || dayjs(new Date()));
        setDescrip(payload.descrip || '');
        setSubject(payload._subj._id);
        setOriginDateContr(payload.originData ? dayjs(new Date(payload.originData.contract)) : null);
        setOriginDateDover(payload.originData ? dayjs(new Date(payload.originData.dover)) : null);
      }
    }
    setIsLoading(false);
  }, [payload]);

  // для передачи в компонент
  const handleSetPrikazAnull = useCallback((value) => {
    setPrikazAnull(value);
  }, []);

  // для передачи в компонент
  const handleSetDateAnull = useCallback((value) => {
    setDateAnull(value);
  }, [])

  //установка флага на изменение сертификата
  const handleChangeEditCertif = useCallback((event) => {
    setEditCertif(event.target.checked);
  }, []);

  // данные о продлении отфильтрованные по контракту
  const filteredProdlenie = useMemo(() => 
    Prodlenie.filter(el => el._contr._id === payload?._id)
      .sort((a, b) => dayjs(b.data_dob).valueOf() - dayjs(a.data_dob).valueOf()),
    [Prodlenie, payload]
  );

  // проверка на дубликат сертификата
  const checkCertifDuplicate = useCallback(() =>{
    const duplicate = Contract.find(el => el.certif === certif.trim());
    if (duplicate) {
      dialogs.alert('Сертификат уже существует.');
      return;
    }
    enqueueSnackbar('Дубликата сертификата нет.', { variant: 'success' });
  },[Contract, certif, dialogs])
  // кнопка проверки на дубликат сертификата
  const btnCheckCertifDuplicate = useMemo(() => (
    <Button 
      disabled={certif.length < 1} 
      variant='outlined' 
      size='small' 
      onClick={checkCertifDuplicate} 
      title='Проверить наличие дубликата сертификата'
    >
      проверить
    </Button>
  ), [certif.length, checkCertifDuplicate]);

  const handleChangeCompany = useCallback((newValue) => {
    setCompany(newValue ? newValue._id : '');
  }, []);

  return (
    <Dialog fullScreen open={open} onClose={() => onClose()}>
      {/* заголовок */}
      <DialogTitle sx={{display:'flex', justifyContent:'space-between'}}>
        <Box>
          Редактирование данных контракта: 
          <span style={{color:`lightblue`}}> послед. редактирование {timeEdit && dayjs(timeEdit).format('DD.MM.YYYY HH:mm') || '| ИДЕТ СОЗДАНИЕ'}</span> 
        </Box>
        <Box>
          <span style={{color:`red`}}>{payload?.prikaz_anull?.length >1 ? 'АННУЛИРОВАН' : ''}</span>
        </Box>
        <Box>
          <Typography variant='caption' sx={{color:`gray`}}>{ '(ESC для выхода)'}</Typography>
        </Box>
      </DialogTitle>

      {/* контент */}
      <DialogContent sx={{bgcolor:payload?.prikaz_anull?.length >1 ? '#f7141429' : '',}}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
            <Typography variant="h6" sx={{ ml: 2 }}>Загрузка данных...</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: `20px`, padding:`20px 0`, }}>
              <Box sx={{display:`flex`, alignItems:`center`, gap:2}}>
                  <TextField
                      id="certif"
                      label="Сертификат*"
                      fullWidth={true}
                      value={certif}
                      onChange={(event) => setCertif(event.target.value)}
                      slotProps={{
                        input: {
                          endAdornment: payload?.prikaz ? 
                          <>
                            <Checkbox checked={editCertif} onChange={handleChangeEditCertif} size='large' title='Изменить только сертификат (используется при обновлении только сертификата)'/>
                            {btnCheckCertifDuplicate}
                          </> :
                          btnCheckCertifDuplicate,
                        },
                      }}
                  />
                  <DatePicker 
                      label="Дата конц. сертиф*"
                      value={dateCertif} 
                      onChange={(newValue) => {setDateCertif(newValue)}} 
                  />
              </Box>
              <CAutoCompleate
                  idComp='company'
                  label='Компании*'
                  memoizedData={Company}
                  elementToSelect={company}
                  onChangeElement={handleChangeCompany}
                  optionLabel='name'
                  getNewOptionLabel={(option) => `${option.name} (${option.unp})`}
              />
              <Box sx={{display:`flex`, alignItems:`center`, gap:1, justifyContent:`space-between`,}}>
                  <Box sx={{display:`flex`, alignItems:`center`, flex:1}}>
                    <DatePicker 
                        label="Оригинальная"
                        value={originDateContr} 
                        onChange={(newValue) => {setOriginDateContr(newValue)}} 
                        sx={{flex:0.3, bgcolor:'listToBlock.main'}}
                        slotProps={{
                          textField: {
                            helperText: originDateContr && originDateContr.format('YYYY') === '2999' ? 'Бессрочный' : '',
                          },
                        }}
                    />
                    <IconButton title='Скопировать' size='small' sx={{m:0}} onClick={()=>{setOriginDateContr(dateContr)}}>
                      <KeyboardDoubleArrowLeftIcon/>
                    </IconButton>
                    <DatePicker 
                        label="Дата контракта*"
                        value={dateContr} 
                        onChange={(newValue) => {setDateContr(newValue)}} 
                        sx={{flex:1}}
                        slotProps={{
                          textField: {
                            helperText: dateContr.format('YYYY') === '2999' ? 'Бессрочный' : '',
                          },
                        }}
                    />
                  </Box>
                  <Box  sx={{display:`flex`, alignItems:`center`, flex:1}}>
                    <DatePicker 
                        label="Оригинальная"
                        value={originDateDover} 
                        onChange={(newValue) => {setOriginDateDover(newValue)}} 
                        sx={{flex:0.3, bgcolor:'listToBlock.main'}}
                        slotProps={{
                          textField: {
                            helperText: originDateDover && originDateDover.format('YYYY') === '2999' ? 'Бессрочный' : '',
                          },
                        }}
                    />
                    <IconButton title='Скопировать' size='small' sx={{m:0}} onClick={()=>{setOriginDateDover(dateDover)}}>
                      <KeyboardDoubleArrowLeftIcon/>
                    </IconButton>
                    <DatePicker 
                        label="Дата доверенности*"
                        value={dateDover} 
                        onChange={(newValue) => {setDateDover(newValue)}} 
                        sx={{flex:1}}
                        slotProps={{
                          textField: {
                            helperText: dateDover.format('YYYY') === '2999' ? 'Бессрочный' : '',
                          },
                        }}
                    />
                  </Box>
                  <IconButton onClick={()=>dialogs.alert('Для того что бы установить дату БЕССРОЧНЫЙ, необходимо указать год 2999.')} title='Для того что бы установить дату БЕССРОЧНЫЙ, необходимо указать год 2999.'><InfoIcon/></IconButton>
              </Box>
              <Box sx={{display:`flex`, alignItems:`center`, gap:1}}>
                  <TextField
                      id="prikaz"
                      label="Приказ*"
                      fullWidth={true}
                      value={prikaz}
                      onChange={(event) => setPrikaz(event.target.value)}
                  />
                  <DatePicker 
                      label="Дата регистрации*"
                      value={dateRegi} 
                      onChange={(newValue) => {setDateRegi(newValue)}} 
                  />
              </Box>
              <TextField
                  id="descrip"
                  label="Описание"
                  fullWidth
                  value={descrip}
                  onChange={(event) => setDescrip(event.target.value)}
              />
          </Box>
        )}
        <hr />
        {payload?.prikaz ? (
          <>
            <Box sx={{display:`flex`, flexDirection:`column`}}>
                <MDataGrid 
                    topSlot={<Typography variant="h6">Продление</Typography>}
                    columns={columnsProdlenie} 
                    tableData={filteredProdlenie}
                    collectionName={`Prodlenie`} 
                    actionDelete={handleDeleteRowBD}
                    actionAdd={async ()=>{
                      await handleAddInTable(`Prodlenie`,DialogProdlenie,{_contr:payload._id}) &&
                      onClose();
                    }}
                />
            </Box>
            {/* аннулирование контракта */}
            <AnullContract 
              setPrikazAnull={handleSetPrikazAnull} 
              setDateAnull={handleSetDateAnull} 
              prikazAnull={prikazAnull} 
              dateAnull={dateAnull} 
              idContract={payload._id}
            />
          </>
        ) : (
          <Box sx={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', mt:'10%'}}>
            <Typography color='gray' variant="h6">Продление и аннулирование возможно после добавления сертификата...</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={() => onClose()}>Отмена</Button>
        <Button
          title="Отправить запрос на сервер"
          onClick={async () => {
            const res = { 
                certif,
                _subj:subject,
                _com:company,
                data_contr:dateContr,
                data_dover:dateDover,
                data_cert:dateCertif,
                data_zakl:dateRegi,
                ...(originDateContr && originDateDover ? { originData:{
                  contract:originDateContr,
                  dover:originDateDover
                }} : {}),
                time_edit:dayjs(new Date()),
                ...(editCertif ? { certif_edit: dayjs(new Date()) } : {}),
                prikaz,
                descrip, 
                _who:getWhoId(payload, Users), 
                data_dob:dataDob
            };
            //итоговая отправка новых данных
            if (certif.length>0 && prikaz.length>0 && company.length>0 && subject ) {
                onClose(res);                
            }
            else if (!subject){
                await dialogs.alert(`Не выбран сотрудник для добавления контракта (выбраны ВСЕ контракты для просмотра).`)
            }
            else {
                await dialogs.alert(`Корректно заполните все поля.`)
            }
          }}
        >
          Отправить
        </Button>
      </DialogActions>

    </Dialog>
  );
}
