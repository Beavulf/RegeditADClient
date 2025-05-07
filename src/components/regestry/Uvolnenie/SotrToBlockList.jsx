import { useUvolnenie } from '../../../websocket/WebSocketContext.jsx'
import { Typography, Box, IconButton } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import InfoIcon from '@mui/icons-material/Info';

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

export default function SotrToBlockList() {
    const Uvolnenie = useUvolnenie()
    const { mode } = useColorScheme();
    const  getNotBlocked = () => {
        return Uvolnenie.filter(el=>!el.descrip.toUpperCase().includes('ЗБ') && dayjs().isAfter(dayjs(el.data_uvol)))
    }

    const elementSotrToBlock = (el) => {
        return (
            <Box key={el._id} sx={{bgcolor:mode==='light' ? 'listToBlock.light' : 'listToBlock.dark', borderRadius:'8px',}}>
                <Box sx={{mt:1}} >{el._sotr.fio}</Box>
                <Box color={'primary.main'}>{el.prikaz} | ув. {dayjs(el.data_uvol).format('DD.MM.YYYY')}</Box>
            </Box>
        )
    }
    return (
        <Box sx={{border:'1px solid gray', borderRadius:'8px', gap:1, overflowY:'auto', p:1, marginBottom:'20px', height:'300px'}}>
            <Typography variant='h5' sx={{display:'flex', justifyContent:'center', alignItems:'center', gap:1}}>
                Надо заблокировать 
                <IconButton size='small' title='Для того, чтобы убрать из списка, добавить в описание ЗБ.'>
                    <InfoIcon sx={{color:'primary.main'}} />
                </IconButton> 
            </Typography>
            <Divider />
            {getNotBlocked() && getNotBlocked().map(el => { return (elementSotrToBlock(el)) } )}           
        </Box>
    )
}