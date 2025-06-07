import { useUvolnenie } from '../../../../websocket/WebSocketContext.jsx'
import { Typography, Box, IconButton } from '@mui/material';
import Divider from '@mui/material/Divider';
import InfoIcon from '@mui/icons-material/Info';
import { memo, useMemo, useCallback, useEffect } from 'react';
import ElementSotrToBlock from './ElementSotrToBlock.jsx';
import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

export default memo(function SotrToBlockList({ router, onSelect }) {
    const Uvolnenie = useUvolnenie()
    // переход на страницу с увольнением
    const handleNavigate = useCallback((fio) => {   
        if (onSelect) { onSelect(fio); }
        if (!router){
            return;
        }
        router.navigate('/registry/uvolnenie');
        sessionStorage.setItem('fioToUvolnenie', JSON.stringify(fio))
    },[onSelect, router])

    // получение списка сотрудников, которые не заблокированы и срок увольнения еще не наступил
    const  getNotBlocked = useMemo(() => {
        return Uvolnenie.filter(el=>!el.descrip.toUpperCase().includes('ЗБ') && (dayjs().isAfter(dayjs(el.data_uvol)) || dayjs().isSame(dayjs(el.data_uvol), 'day')))
    },[Uvolnenie])
    
    return (
        <Box sx={{border:'1px solid gray', borderRadius:'8px', overflowY:'auto', display:'flex', flexDirection:'column', height:'100%'}}>
            <Typography variant='h5' sx={{display:'flex', justifyContent:'center', alignItems:'center', gap:1}}>
                Надо заблокировать 
                <IconButton size='small' title='Для того, чтобы убрать из списка, добавить в описание ЗБ.'
                    onClick={() => handleNavigate(null)}>
                    <InfoIcon sx={{color:'primary.main'}} />
                </IconButton> 
            </Typography>
            <Divider />
            <Box sx={{
                flex: 1,
                overflowY: 'auto',
                p: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
            }}>
                {getNotBlocked && getNotBlocked.map(el => <ElementSotrToBlock key={el._id} uvolnenie={el} handleNavigate={handleNavigate}/>)}
            </Box>           
        </Box>
    )
})
