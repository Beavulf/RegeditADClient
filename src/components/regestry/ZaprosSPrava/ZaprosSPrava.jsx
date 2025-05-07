import { useState, useMemo, useEffect } from 'react';
import { useTableActions } from '../../../websocket/LayoutMessage.jsx';
import MDataGrid from '../../DataGrid/MDataGrid.jsx';
import { useZaprosSPrava } from '../../../websocket/WebSocketContext.jsx'
import VisibilityIcon from '@mui/icons-material/Visibility';
import DialogZaprosSPrava from './DialogZaprosSPrava.jsx';
import InfoIcon from '@mui/icons-material/Info';

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
    useEffect(()=>{
      setFilteredData(ZaprosSPrava.sort((a, b) => dayjs(b.data_dob).valueOf() - dayjs(a.data_dob).valueOf()))
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

    function PravaPopoverCell({ value }) {
        const [anchorEl, setAnchorEl] = useState(null);
      
        const open = Boolean(anchorEl);
        const handleClick = (event) => {
          event.stopPropagation(); // важно — не выделять строку
          setAnchorEl(event.currentTarget);
        };
        const handleClose = () => setAnchorEl(null);
      
        const filteredPrava = value.filter(el=>el.status === 1 || el.status === 2).map(el=>`#${el.id}${el.status===2 ? '-S':''}`).join(', ')

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
          setFilteredData(ZaprosSPrava.sort((a, b) => dayjs(b.data_dob).valueOf() - dayjs(a.data_dob).valueOf()))
          return;
        }
        const prava = str.split(',').map(el=>el.trim())
        const filteredZaprosSPrava = ZaprosSPrava.filter(el=>{
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

    return (
        <Box>
          <Box sx={{display:'flex', justifyContent:'center', alignItems:'center'}}>
            <IconButton size='small' title='Для поиска необходимо вводить номера прав через запятую, если необходимо уточнить Спец право - 2, или Просто выдано - 1, или Не выдано - 0. Указать через дефис - статус права (1,2,3-2,4-0) - это значит показать только те у кого выдано 1-е право (неважно спец или обычное), также у него есть 2-е право, 3-е только Спец, 4-е вообще не выдано'>
                <InfoIcon sx={{color:'primary.main'}} />
            </IconButton> 
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
            />
            <Button onClick={()=>filterWithPrava(pravaToSearch)}>Поиск</Button>
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
    );
}
