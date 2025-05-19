import { useState, useMemo, useEffect } from 'react';
import { useTableActions } from '../../../websocket/LayoutMessage.jsx';
import MDataGrid from '../../DataGrid/MDataGrid.jsx';
import { useZaprosSPrava, usePravaOtdel, useWebSocketContext, useOtdel } from '../../../websocket/WebSocketContext.jsx'
import VisibilityIcon from '@mui/icons-material/Visibility';
import DialogZaprosSPrava from './DialogZaprosSPrava.jsx';
import InfoIcon from '@mui/icons-material/Info';
import Collapse from '@mui/material/Collapse';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Autocomplete, FormControl } from '@mui/material';
import { useSnackbar } from 'notistack';

import {
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,

  Box,
  Button,
  TextField,
  Typography
} from '@mui/material';

const statusLabels = {
    0: { icon: '❌', text: 'Не выдано' },
    1: { icon: '✅', text: 'Выдано' },
    2: { icon: '⚠️', text: 'Спец' },
};

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

export default function ZaprosForm() {
    const { handleDeleteRowBD, handleAddInTable, handleEditRow } = useTableActions();
    const ZaprosSPrava = useZaprosSPrava()
    const [pravaToSearch, setPravaToSearch] = useState('')
    const [filteredData, setFilteredData] = useState(ZaprosSPrava);
    const [openOtdInfo, setOpenOtdInfo] = useState(false);
    const [openOtdEdit, setOpenOtdEdit] = useState(false);
    const [newOtdName, setNewOtdName] = useState('');
    const [newOtdPrava, setNewOtdPrava] = useState('');
    const [newOtdDescrip, setNewOtdDescrip] = useState('');
    const PravaOtdel = usePravaOtdel()
    const { sendJsonMessage } = useWebSocketContext();
    const Otdel = useOtdel()
    const { enqueueSnackbar } = useSnackbar();

    useEffect(()=>{
      setFilteredData([...ZaprosSPrava].sort((a, b) => dayjs(b.data_dob).valueOf() - dayjs(a.data_dob).valueOf()))
    },[ZaprosSPrava])

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
            {
                flex:1,
                field: 'prava',
                headerName: 'Права',
                sortable: false,
                renderCell: (params) => <PravaPopoverCell value={params.value} />,
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
            { field: '_who', headerName: 'Кто доб.',  flex:0.3,
            valueGetter: (params) => params?.name || ''
            }, 
            { field: 'descrip', headerName: 'Описание', flex:0.1, },
        ],[]
        )

    // отображение прав в таблице списком по иконке
    function PravaPopoverCell({ value }) {
        const [anchorEl, setAnchorEl] = useState(null);
      
        const open = Boolean(anchorEl);
        const handleClick = (event) => {
          event.stopPropagation(); // важно — не выделять строку
          setAnchorEl(event.currentTarget);
        };
        const handleClose = () => setAnchorEl(null);
      
        const filteredPrava = [...value].filter(el=>el.status === 1 || el.status === 2).map(el=>`#${el.id}${el.status===2 ? '-S':''}`).join(', ')

        return (
          <>
            {filteredPrava}
            <IconButton size="small" onClick={handleClick}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
              
            <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
              <List dense sx={{ maxWidth: 250, p: 1 }}>
                {value?.map((p) => (
                  <ListItem key={p.id} disablePadding>
                    <ListItemText
                      primary={
                        `#${p.id}: ${statusLabels[p.status]?.icon || '—'} ${statusLabels[p.status]?.text || ''}`
                      }
                      secondary={p.note || null}
                    />
                  </ListItem>
                ))}
              </List>
            </Popover>
          </>
        );
      }

      // фильтрация таблицы по определенным правам -2 спец найти, -1 просто выдано, -0 не выдано
      function filterWithPrava(str) {
        if (str === '') {          
          setFilteredData([...ZaprosSPrava].sort((a, b) => dayjs(b.data_dob).valueOf() - dayjs(a.data_dob).valueOf()))
          return;
        }
        const prava = str.split(',').map(el=>el.trim())
        const filteredZaprosSPrava = [...ZaprosSPrava].filter(el=>{
          // const numberOfPrava = prava.map(el=> Number(el))
          return prava.every(numberAndStatus => {
            const number = Number(numberAndStatus.split('-')[0])
            const status = Number(numberAndStatus.split('-')[1])
            const pravo = el.prava[number - 1];
            if (status === 2 || status === 1) {              
              return pravo && pravo.status === status 
            }
            if (status === 0) {
              return pravo && pravo.status === status 
            } 
            else {
              return pravo && (pravo.status === 1 || pravo.status === 2)
            }
          });
        })  
        setFilteredData(filteredZaprosSPrava);    
        return    
      }

      // добавление отдела и прав для него
      const handleAddPravaOtdel = async ()=> {
        if (!newOtdName || !newOtdPrava) {
          enqueueSnackbar('Необходимо заполнить все поля', { variant: 'warning' });
          return;
        }
        const mask = /^(\d+(-\d)?)(,\d+(-\d)?)*$/
        if (!mask.test(newOtdPrava)) {
          enqueueSnackbar('Некорректный формат прав', { variant: 'warning' });
          return;
        }
        const formattedPrava = newOtdPrava.split(',').map(el=>'#'+el.trim()).join(', ')
        const message = {
          type: 'insertInToCollection',
          data: {
            collection: 'PravaOtdel',
            body: {
              _otdel:newOtdName,
              prava:formattedPrava,
              descrip:newOtdDescrip || ''
            }
          }
        };
        await sendJsonMessage(message);
      }
      
      // отмена добавления отдела и прав для него
      const handleCancelAddPravaOtdel = ()=> {
        setOpenOtdEdit(false)
        setNewOtdName('')
        setNewOtdPrava('')
        setNewOtdDescrip('')
      }
      
      // получение элемента для отображения прав отдела
      const getElementPravaOtdel = (el) => {
        return (
          <Box 
            key={el._otdel._id} 
            sx={{display:'flex', gap:1, flexDirection:'column', bgcolor:'listPravaOtdel.main', p:1, borderRadius:'8px', mb:1,
              '&:hover':{scale:1.03}, 
              transition:'scale 0.3s ease-in-out', cursor:'pointer'
            }}
          >
              <Typography textAlign='left'>
                {el._otdel.name}
              </Typography>
              <TextField sx={{bgcolor:'listPravaOtdel.dark', borderRadius:'8px', p:0.5}} size='small' variant='standard' fullWidth value={el.prava}/>
          </Box>
        )
      }
    return (
        <Box sx={{display:'flex', gap:1, overflow:'hidden'}}>

          {/* блок с информацией о правах отделов */}
          <Box sx={{flex:'0 0 auto',}}>
            <Collapse 
              orientation="horizontal" in={openOtdInfo} 
              sx={{gap:1, border:'1px solid gray', borderRadius:'8px', padding:1, height:'100%', display:'flex', flexDirection:'column'}}
            >
              {/* блок элемента с информацией о правах отдела */}
                <Box sx={{display:'flex',  width:'400px', flexDirection:'column', height:'100%'}}>
                  <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:1}}>
                    <Typography variant='h6'>
                      Права отделов
                    </Typography>
                    <IconButton onClick={()=>setOpenOtdEdit((prev)=>!prev)} title='Добавить Отдел и права для него'>
                      <AddCircleOutlineIcon/>
                    </IconButton>
                  </Box>

                  {/* блок для добавления нового отдела и прав для него */}
                  <Collapse 
                    orientation="vertical" in={openOtdEdit} 
                    sx={{gap:1, border:'1px solid gray', borderRadius:'8px', width:'100%', mt:1, mb:1, }}
                  >
                    <FormControl fullWidth>
                      <Autocomplete
                          id="pto"
                          value={Otdel.find(o => o._id === newOtdName) || null}
                          onChange={(event, newValue) => {
                              setNewOtdName(newValue ? newValue._id : '')
                          }}
                          onInputChange={(event, value) => {
                              // Фильтруем варианты по введенному значению
                              const filteredOptions = Otdel.filter(option => option.name.toLowerCase().includes(value.toLowerCase()));
                              // Если после фильтрации остался только один вариант, автоматически выбираем его
                              if (filteredOptions.length === 1) {
                                  setNewOtdName(filteredOptions[0]._id);
                                  event?.target?.blur();
                              }
                          }}
                          options={Otdel}
                          getOptionLabel={(option) => option.name}
                          isOptionEqualToValue={(option, value) => option._id === value?._id}
                          title='Выбор Отдела'
                          renderInput={(params) => (
                              <TextField
                                  {...params}
                                  label="Отдел"
                                  variant="outlined"
                              />
                          )}
                      />
                    </FormControl>
                    <TextField label='Права' fullWidth size='small' variant='filled' value={newOtdPrava} onChange={e=>setNewOtdPrava(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddPravaOtdel();
                        }
                      }}
                      slotProps={{
                        input: {
                          endAdornment: 
                            (<IconButton size='small' title='Права перечисляются через запятую, и могут быть спец права (1,2,3-2)'>
                              <InfoIcon sx={{color:'primary.main'}} />
                            </IconButton> )
                        }
                      }}
                    />
                    <TextField label='Описание' fullWidth size='small' variant='filled' value={newOtdDescrip} onChange={e=>setNewOtdDescrip(e.target.value)}/>
                    <Box sx={{display:'flex', justifyContent:'flex-end', gap:0.2, p:0.2}}>
                      <Button fullWidth variant='contained' onClick={handleAddPravaOtdel}>Добавить</Button>
                      <Button fullWidth variant='outlined' onClick={handleCancelAddPravaOtdel}>Отмена</Button>
                    </Box>
                  </Collapse>

                  {/* список элементов с информацией о правах отделов */}
                  <Box sx={{display:'flex', flexDirection:'column', gap:1, overflowX:'hidden'}}>
                    {PravaOtdel.map(el=>getElementPravaOtdel(el))}
                  </Box>
                </Box>
            </Collapse>
          </Box>

          {/* блок с таблицей прав и поиском */}
          <Box sx={{flex:1,}}>
            {/* блок со строкой поиска и кнопкой поиска */}
            <Box sx={{display:'flex', justifyContent:'center', alignItems:'center', gap:1}}>
              <Button variant='outlined' onClick={()=>setOpenOtdInfo((prev)=>!prev)}>
                Права отделов
              </Button>
              <TextField 
                label='Поиск по номерам и статусам ПРАВ, через запятую (Enter для поиска, Esc для очистки)' 
                fullWidth 
                size='small' 
                variant='standard'
                value={pravaToSearch}
                onChange={e=>setPravaToSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    filterWithPrava(pravaToSearch);
                  }
                  if (e.key === 'Escape') {
                    setPravaToSearch('')
                    filterWithPrava('')
                  }
                }}
                slotProps={
                  {
                    input: {
                      endAdornment: 
                        (<IconButton size='small' title='Для поиска необходимо вводить номера прав через запятую, если необходимо уточнить Спец право - 2, или Просто выдано - 1, или Не выдано - 0. Указать через дефис - статус права (1,2,3-2,4-0) - это значит показать только те у кого выдано 1-е право (неважно спец или обычное), также у него есть 2-е право, 3-е только Спец, 4-е вообще не выдано'>
                          <InfoIcon sx={{color:'primary.main'}} />
                        </IconButton> )
                      }
                    }
                  }
              />
              <Button onClick={()=>filterWithPrava(pravaToSearch)} variant='text'>Поиск</Button>
            </Box>

            <MDataGrid 
              columns={columnsZaprosSPrava} 
              tableData={filteredData}
              collectionName={`ZaprosSPrava`} 
              actionEdit={(id,oldData,collectionName)=>handleEditRow(id,oldData,collectionName,DialogZaprosSPrava)}
              actionDelete={handleDeleteRowBD}
              actionAdd={()=>handleAddInTable(`ZaprosSPrava`,DialogZaprosSPrava)}
            />
            <Typography variant='body' color='gray'>Статусы: ❌- 0 - не выдано, ✅ - 1 - выдано, ⚠️ - 2 - спец; S - spec</Typography>
          </Box>
        </Box>
    );
}
