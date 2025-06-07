import { Collapse, Box, Typography, IconButton, FormControl, TextField, Button, Autocomplete } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useSnackbar } from 'notistack';
import { memo, useState, useMemo, useCallback } from 'react';
import { useWebSocketContext, useOtdel, usePravaOtdel } from '../../../../websocket/WebSocketContext.jsx'
import { useDialogs } from '@toolpad/core/useDialogs';
import ElementPravaOtdel from './ElemetPravaOtdel.jsx';

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');


const ListPravaOtdel = ({openOtdInfo})=>{
    const Otdel = useOtdel()
    const PravaOtdel = usePravaOtdel()
    const { sendJsonMessage } = useWebSocketContext();
    const { enqueueSnackbar } = useSnackbar();
    const dialogs = useDialogs();

    const [newOtdName, setNewOtdName] = useState('');
    const [newOtdPrava, setNewOtdPrava] = useState('');
    const [newOtdDescrip, setNewOtdDescrip] = useState('');
    const [updatePravaOtdel, setUpdatePravaOtdel] = useState(null);
    const [openOtdEdit, setOpenOtdEdit] = useState(false);

    const filteredPrava = useMemo(()=>{
        return [...PravaOtdel].sort((a, b) => new Date(b.data_edit) - new Date(a.data_edit))
    },[PravaOtdel])
    
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
        // если выбрали обновить права отдела
        if (updatePravaOtdel) {
          const formattedPrava = newOtdPrava.split(',').map(el=>'#'+el.trim()).join(', ')
          const message = {
            type: 'updateInCollection',
            data: {
              collection: 'PravaOtdel',
              filter: { _id: updatePravaOtdel },
              value: { prava:formattedPrava, descrip:newOtdDescrip || '', data_edit:dayjs() },
            },
          };
          await sendJsonMessage(message);
          handleCancelAddPravaOtdel()
          enqueueSnackbar('Права отдела обновлены', { variant: 'success' });
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
        handleCancelAddPravaOtdel()
      }
  
    // удаление права отдела
    const handleDeletePravaOtdel = useCallback(async (id) => {
      const confirmed = await dialogs.confirm('Вы уверены, что хотите удалить этот отдел и его права?', {
        okText: 'Да',
        cancelText: 'Нет'
      });
      if (confirmed) {
        const message = {
          type: 'deleteFromCollection',
          data: { collection: 'PravaOtdel', filter: { _id: id } }
        };
        await sendJsonMessage(message);
      }
    },[])
    
    // отмена добавления отдела и прав для него
    const handleCancelAddPravaOtdel = ()=> {
      setOpenOtdEdit(false)
      setNewOtdName('')
      setNewOtdPrava('')
      setNewOtdDescrip('')
      setUpdatePravaOtdel(null)
    }
    
    // редактирование права отдела вставка данных в форму
    const handleEditPravaOtdel = useCallback((el)=> {
      setUpdatePravaOtdel(el._id)
      setOpenOtdEdit(true)
      setNewOtdName(el._otdel._id)
      setNewOtdPrava(el.prava.split('#').map(el=>el.trim()).join(''))
      setNewOtdDescrip(el.descrip)
    },[])
    
    return (
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
                    <Button fullWidth variant='contained' onClick={handleAddPravaOtdel}>{updatePravaOtdel ? 'Обновить' : 'Добавить'}</Button>
                    <Button fullWidth variant='outlined' onClick={handleCancelAddPravaOtdel}>Отмена</Button>
                </Box>
                </Collapse>

                {/* список элементов с информацией о правах отделов */}
                <Box sx={{display:'flex', flexDirection:'column', gap:1, overflowX:'hidden', flex: 1, minHeight: 0, overflowY: 'auto'}}>
                    {filteredPrava.map(el=>
                        <ElementPravaOtdel 
                            key={el._otdel._id} 
                            el={el} 
                            handleEditPravaOtdel={handleEditPravaOtdel} 
                            handleDeletePravaOtdel={handleDeletePravaOtdel} 
                        />
                    )}
                </Box>
            </Box>
        </Collapse>
    )
}

export default memo(ListPravaOtdel);