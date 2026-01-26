import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTableActions } from '../../../websocket/LayoutMessage.jsx';
import MDataGrid from '../../DataGrid/MDataGrid.jsx';
import { useZaprosSPrava, useSotrudnik, useOtdel } from '../../../websocket/WebSocketContext.jsx'
import DialogZaprosSPrava from './DialogSPrava/DialogZaprosSPrava.jsx';
import DialogPravaFromOtdel from './DialogSPrava/DialogPravaFromOtdel.jsx';
import InfoIcon from '@mui/icons-material/Info';
import PravaPopoverCell from './PravaPopoverCell.jsx';
import ListPravaOtdel from './PravaOtdel/ListPravaOtdel.jsx';
import { useSetFocusAndText } from '../../hooks/SetFocusAndText.jsx';
import CAutoCompleate from '../../utils/CAutoCompleate.jsx';
import {
  IconButton,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

export default function ZaprosForm() {
    const { handleDeleteRowBD, handleAddInTable, handleEditRow } = useTableActions();
    const ZaprosSPrava = useZaprosSPrava();
    const Otdel = useOtdel();
    const sotrudniki = useSotrudnik();

    const [filteredData, setFilteredData] = useState([]);
    const [pravaToSearch, setPravaToSearch] = useState('');
    const [openOtdInfo, setOpenOtdInfo] = useState(false);
    const [openPravaFromOtdel, setOpenPravaFromOtdel] = useState(false);
    const [otdel, setOtdel] = useState('');

    useSetFocusAndText(setPravaToSearch, 'pravaToSearch')

    // получения списка людей и их прав по выбранному отделу
    const peopleFromOtdel = useCallback((otdelName) => {
      if (!otdelName) return [];

      return ZaprosSPrava
        .map((z) => {
          const sotr = sotrudniki.find((s) => s._id === z?._sotr?._id);
          if (!sotr) return null;
          const sotrOtdelName = sotr?._otdel?.name;
          if (!sotrOtdelName) return null;
          if (sotrOtdelName !== otdelName) return null;
          return z;
        })
        .filter(Boolean);
    }, [ZaprosSPrava, sotrudniki]);

    const peopleFromSelectedOtdel = useMemo(() => {
      return peopleFromOtdel(otdel);
    }, [peopleFromOtdel, otdel]);

    // сортировка данных по дате добавления (используется как изначальные данные)
    const filteredDataOrigin = useMemo(()=>{
      return ZaprosSPrava.sort((a, b) => dayjs(b.data_dob).valueOf() - dayjs(a.data_dob).valueOf())
    },[ZaprosSPrava])

    // установка изначальных данных
    useEffect(()=>{
      setFilteredData(filteredDataOrigin)
    },[filteredDataOrigin])

    const columnsZaprosSPrava = useMemo(()=>
      [
          { field: '_sotr', headerName: 'ФИО',  flex:0.7,
              valueGetter: (params) => params?.fio || ''
          }, 
          { field: 'prikaz', headerName: 'Приказ',flex:0.2},
          { field: 'data_prikaza', headerName: 'Дата приказа',flex:0.3,
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
          { flex:1, field: 'prava', headerName: 'Права', sortable: false, 
            renderCell: (params) => <PravaPopoverCell value={params.value} /> 
          },
          { field: 'data_dob', headerName: 'Дата доб.',flex:0.3,
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
          { field: '_who', headerName: 'Кто доб.',  flex:0.25,
            valueGetter: (params) => params?.name || ''
          }, 
          { field: 'descrip', headerName: 'Описание', flex:0.1, },
      ],[]
    )

    // фильтрация таблицы по правам -2 спец найти, -1 просто выдано, -0 не выдано
    const filterWithPrava = useCallback((pravaToSearch) => {      
      if (pravaToSearch === '') {          
        setFilteredData(filteredDataOrigin)
        return;
      }
      const prava = pravaToSearch.split(',').map(el=>el.trim())
      const filteredZaprosSPrava = ZaprosSPrava.filter(el=>{
        return prava.every(numberAndStatus => {
          const number = Number(numberAndStatus.split('-')[0])
          const status = Number(numberAndStatus.split('-')[1])
          const pravo = el.prava[number - 1];
          if (status !== undefined && !isNaN(status)) {
            // Если статус явно указан, сравниваем строго с ним
            return pravo && pravo.status === status;
          } else {
            // Если статус не указан, показываем только те, у кого статус 1 или 2 (или можно изменить на любые нужные)
            return pravo && (pravo.status === 1 || pravo.status === 2);
          }
        });
      })  
      setFilteredData(filteredZaprosSPrava);    
      return;
    },[filteredDataOrigin,ZaprosSPrava])

    // фильтрация таблицы по имени отдела
    const handleChangeOldOtdel = useCallback((newValue) => {
      setOtdel(newValue ? newValue.name : '')
    }, []);

    // отображение подсказок для статусов
    const helperStatusInfo = (
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', flex:1 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center',  flexWrap: 'wrap', flex:0.5 }}>
          <CAutoCompleate
              idComp={`old-otdel`}
              label={`Отдел`}
              memoizedData={Otdel}
              elementToSelect={otdel}
              onChangeElement={handleChangeOldOtdel}
              optionLabel='name'
              newSize='small'
          /> 
          <Button
            variant="outlined"
            // disabled={!selectedOtdelName}
            onClick={() => setOpenPravaFromOtdel(true)}
          >
            Права отдела
          </Button>
        </Box>
        <Typography variant='body' color='gray'>Статусы: ❌- 0 - не выдано, ✅ - 1 - выдано, ⚠️ - 2 - спец; S - spec</Typography>
      </Box>
    )

    return (
        <Box sx={{display:'flex', gap:1, overflow:'hidden', height: '80vh'}}>

          {/* блок с информацией о правах отделов */}
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <ListPravaOtdel openOtdInfo={openOtdInfo}/>
          </Box>

          {/* блок с таблицей прав и поиском */}
          <Box sx={{flex:1, height:'100%', display: 'flex', flexDirection: 'column'}}>
            {/* блок со строкой поиска и кнопкой поиска */}
            <Box sx={{display:'flex', justifyContent:'center', alignItems:'center', gap:1, mb:1}}>
              <Button variant='outlined' onClick={()=>setOpenOtdInfo((prev)=>!prev)}>
                Права отделов
              </Button> 
              <TextField 
                id='pravaToSearch'
                label='Поиск по номерам и статусам ПРАВ, через запятую (Enter для поиска, Esc для сброса)' 
                fullWidth 
                size='small' 
                variant='standard'
                value={pravaToSearch}
                onChange={e=>setPravaToSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && pravaToSearch !== '') {
                    filterWithPrava(pravaToSearch);
                  }
                  if (e.key === 'Escape') {
                    setPravaToSearch('')
                    setFilteredData(filteredDataOrigin)
                  }
                }}
                slotProps={
                  {
                    input: {
                      endAdornment: 
                        (<IconButton size='small' title='Для поиска необходимо вводить номера прав через запятую, если необходимо уточнить - Спец право - 2, Просто выдано - 1, Не выдано - 0. Указать через дефис статус права (1,2,3-2,4-0) - это значит показать только те у кого выдано 1-е право (неважно спец или обычное), также у него есть 2-е право, 3-е только Спец, 4-е вообще не выдано'>
                          <InfoIcon sx={{color:'primary.main'}} />
                        </IconButton> )
                      }
                    }
                  }
              />
              <Button disabled={pravaToSearch === ''} onClick={()=>filterWithPrava(pravaToSearch)} variant='text'>Поиск</Button>
            </Box>

            <MDataGrid 
              topSlot={helperStatusInfo}
              columns={columnsZaprosSPrava} 
              tableData={filteredData}
              collectionName={`ZaprosSPrava`} 
              actionEdit={(id,oldData,collectionName)=>handleEditRow(id,oldData,collectionName,DialogZaprosSPrava)}
              actionDelete={handleDeleteRowBD}
              actionAdd={()=>handleAddInTable(`ZaprosSPrava`,DialogZaprosSPrava)}
            />
          </Box>

          <DialogPravaFromOtdel
            open={openPravaFromOtdel}
            onClose={() => setOpenPravaFromOtdel(false)}
            otdelName={otdel}
            people={peopleFromSelectedOtdel}
          />
        </Box>
    );
}
