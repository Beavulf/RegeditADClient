import MDataGrid from '../DataGrid/MDataGrid.jsx';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Fade from '@mui/material/Fade';
import InfoIcon from '@mui/icons-material/Info';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState, useEffect, useMemo } from 'react';
import { TextField, Box, FormControl, Autocomplete, Typography, Checkbox, IconButton } from '@mui/material';
import { useUsers, useCompany, useProdlenie, useWebSocketContext } from '../../websocket/WebSocketContext.jsx'
import { useDialogs } from '@toolpad/core/useDialogs';
import { useTableActions } from '../../websocket/LayoutMessage.jsx';
import DialogProdlenie from './DialogProdlenie.jsx';

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

export default function DialogContract({ payload, open, onClose,  }) {
  const dialogs = useDialogs();
  const {sendJsonMessage} = useWebSocketContext()
  const Users = useUsers()
  const Company = useCompany()
  const Prodlenie = useProdlenie()
  const { handleDeleteRowBD, handleAddInTable } = useTableActions();
  const [fade, setFade] = useState(false)

  //данные контракта
  const [subject, setSubject] = useState(``)
  const [certif, setCertif] = useState('');
  const [dateCertif, setDateCertif] = useState(dayjs(new Date())); 
  const [company, setCompany] = useState('');
  const [dateContr, setDateContr] = useState(dayjs(new Date()));
  const [dateDover, setDateDover] = useState(dayjs(new Date()));
  const [dateRegi, setDateRegi] = useState(dayjs(new Date()));
  const [prikaz, seetPrikaz] = useState(``)
  const [timeEdit, setTimeEdit] = useState(null);
  const [editCertif, setEditCertif] = useState(false);

  const [prikazAnull, setPrikazAnull] = useState('')
  const [dateAnull, setDateAnull] = useState(dayjs(new Date()))

  const [dataDob, setDataDob] = useState(dayjs(new Date()))
  const [descrip, setDescrip] = useState('');

  const conf = {btnfilter:true,}

  // Заполняем начальные данные при открытии окна
  useEffect(() => {     
    if (payload) {   
        if (payload.addcontext) {  
            setSubject(payload.addcontext._id);
        } else {      
        setPrikazAnull(payload.prikaz_anull || '');
        setDateAnull(dayjs(new Date(payload.data_anull)) || dayjs(new Date()).format('DD.MM.YYYY'));

        setCertif(payload.certif || '');
        setTimeEdit(dayjs(new Date(payload.time_edit)) || dayjs(new Date()).format('DD.MM.YYYY HH:mm'));
        setDateCertif(dayjs(new Date(payload.data_cert)) || dayjs(new Date()));
        setCompany(payload._com._id || '');
        setDateContr(dayjs(new Date(payload.data_contr)) || dayjs(new Date()));
        setDateDover(dayjs(new Date(payload.data_dover)) || dayjs(new Date()));
        setDateRegi(dayjs(new Date(payload.data_zakl)) || dayjs(new Date()));
        seetPrikaz(payload.prikaz || '');
        setDataDob(dayjs(new Date(payload.data_dob)) || dayjs(new Date()));
        setDescrip(payload.descrip || '');
        setSubject(payload._subj._id);
        }
    }
  }, [payload]);

  //установка флага на изменение сертификата
  function handleChangeEditCertif(event) {
    setEditCertif(event.target.checked);
  }

  // аннулирование контракта
  async function handleAnullClick() {
    if (prikazAnull.length > 0 && dateAnull!=null) {
      const confirmed = await dialogs.confirm(`Аннулировать контракт ?`, {
        okText: 'Да',
        cancelText: 'Нет',
      });
      if (confirmed) {
        const message = {
          type: 'updateInCollection',
          data: {
            collection: 'Contract',
            filter: { _id: payload._id },
            value: { prikaz_anull:prikazAnull, data_anull:dateAnull, anull:true },
          },
        };
        sendJsonMessage(message);
      }
      setFade(false)
    }
    else {
      dialogs.alert('Заполните поля "Приказ аннулирования" и "Дата аннулирования"!')
    }
  }
  const columnsProdlenie = useMemo(()=>
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
        { field: '_who', headerName: 'Кто доб.',  width:`80`,
            valueGetter: (params) => params?.name || ''
        }, 
        { field: 'descrip', headerName: 'Описание', width: 150, flex:0.12, },
    ],[]) 

  return (
    <Dialog fullScreen open={open} onClose={() => onClose()} >
      <DialogTitle sx={{display:'flex', justifyContent:'space-between'}}>
        <Box>
          Редактирование данных контракта: 
          <span style={{color:`lightblue`}}> послед. редактирование {dayjs(timeEdit).format('DD.MM.YYYY HH:mm')}</span> 
        </Box>
        <Box>
          <span style={{color:`red`}}>{payload?.prikaz_anull?.length >1 ? 'АННУЛИРОВАН' : ''}</span>
        </Box>
        <Box>
          <Typography variant='caption' sx={{color:`gray`}}>{ '(ESC для выхода)'}</Typography>
          {console.log(payload)
          }
        </Box>
      </DialogTitle>
      <DialogContent sx={{bgcolor:payload?.prikaz_anull?.length >1 ? '#f7141429' : '',}}>
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
                        endAdornment:  <Checkbox checked={editCertif} onChange={handleChangeEditCertif} size='large' title='Изменить только сертификат (используется при обновлении только сертификата)'/>,
                      },
                    }}
                />
                <DatePicker 
                    label="Дата конц. сертиф"
                    value={dateCertif} 
                    onChange={(newValue) => {setDateCertif(newValue)}} 
                />
            </Box>
            <FormControl sx={{ flex: `1` }}>
                <Autocomplete
                    id="company"
                    value={Company.find(o => o._id === company) || null}
                    onChange={(event, newValue) => {
                        setCompany(newValue ? newValue._id : '');
                    }}
                    onInputChange={(event, value) => {
                        const filteredOptions = Company.filter(option =>
                            option.name.toLowerCase().includes(value.toLowerCase()) || 
                            option.unp.toString().includes(value.toLowerCase())
                        );
                        if (filteredOptions.length === 1) {
                            setCompany(filteredOptions[0]._id);
                            event?.target?.blur();
                        }
                    }}
                    options={Company}
                    getOptionLabel={(option) => `${option.name} (${option.unp})`} // Показываем и имя, и УНП
                    isOptionEqualToValue={(option, value) => option._id === value?._id}
                    title="Выбор компании"
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Компании*"
                            variant="outlined"
                        />
                    )}
                />
            </FormControl>
            <Box sx={{display:`flex`, alignItems:`center`, gap:1, justifyContent:`space-between`,}}>
                <DatePicker 
                    label="Дата контракта"
                    value={dateContr} 
                    onChange={(newValue) => {setDateContr(newValue)}} 
                    sx={{flex:1}}
                    slotProps={{
                      textField: {
                        helperText: dateContr.format('YYYY') === '2999' ? 'Бессрочный' : '',
                      },
                    }}
                />
                <DatePicker 
                    label="Дата доверенности"
                    value={dateDover} 
                    onChange={(newValue) => {setDateDover(newValue)}} 
                    sx={{flex:1}}
                    slotProps={{
                      textField: {
                        helperText: dateDover.format('YYYY') === '2999' ? 'Бессрочный' : '',
                      },
                    }}
                />
                <IconButton onClick={()=>alert('Для того что бы установить дату БЕССРОЧНЫЙ, необходимо указать год 2999.')} title='Для того что бы установить дату БЕССРОЧНЫЙ, необходимо указать год 2999.'><InfoIcon/></IconButton>
            </Box>
            <Box sx={{display:`flex`, alignItems:`center`, gap:1}}>
                <TextField
                    id="prikaz"
                    label="Приказ*"
                    fullWidth={true}
                    value={prikaz}
                    onChange={(event) => seetPrikaz(event.target.value)}
                />
                <DatePicker 
                    label="Дата регистрации"
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
        <hr />
        <Box sx={{display:`flex`, flexDirection:`column`}}>
            <Typography variant="h6">Продление</Typography>
            <MDataGrid 
                conf={conf}
                columns={columnsProdlenie} 
                tableData={Prodlenie.filter(el=>el._contr._id === payload._id)}
                collectionName={`Prodlenie`} 
                actionEdit={()=>console.log('no')}
                actionDelete={handleDeleteRowBD}
                actionAdd={async ()=>{await handleAddInTable(`Prodlenie`,DialogProdlenie,{_contr:payload._id}) && onClose()}}
            />
        </Box>
        {/* аннулирование контракта */}
        <Box sx={{display:'flex', gap:1, alignItems:'center', margin:'0.5rem 0'}}>
            <Button variant={fade === false ? 'outlined' : 'contained'} sx={{height:'55px'}} color='error' onClick={()=>setFade((prev)=>!prev)}>
              аннулировать
            </Button>
              <Fade in={fade}>
                <Box sx={{display:'flex', gap:1, alignItems:'center'}}>
                  <TextField
                      id="prikaz-anull"
                      label="Приказ"
                      fullWidth
                      value={prikazAnull}
                      onChange={(event) => setPrikazAnull(event.target.value)}
                  />
                  <DatePicker 
                    label="Дата аннулирования"
                    value={dateAnull} 
                    onChange={(newValue) => {setDateAnull(newValue)}} 
                  />
                  <Button variant='contained' sx={{height:'55px'}} onClick={()=>{handleAnullClick(); }}>ok</Button>
                </Box>
              </Fade>
        </Box>
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
                time_edit:dayjs(new Date()),
                ...(editCertif ? { certif_edit: dayjs(new Date()) } : {}),
                prikaz,
                descrip, 
                //при добавлении новой записи вставляем , если изменяем запись не трогаем
                _who:(payload?._who && payload?._who?._id) || Users.find(el=>el.address === localStorage.getItem(`clientIp`))._id, 
                data_dob:dataDob
            };
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
