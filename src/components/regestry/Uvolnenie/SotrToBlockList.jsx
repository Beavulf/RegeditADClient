import { useUvolnenie } from '../../../websocket/WebSocketContext.jsx'
import { Typography, Box, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import InfoIcon from '@mui/icons-material/Info';

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

export default function SotrToBlockList({ router, onSelect }) {
    const Uvolnenie = useUvolnenie()
    const theme = useTheme()

    // переход на страницу с увольнением
    const handleNavigate = (fio) => {   
        if (onSelect) {
            onSelect(fio);
        }
        if (!router){
            sessionStorage.setItem('fioToUvolnenie', JSON.stringify(fio))
            return;
        }
        router.navigate('/registry/uvolnenie');
        sessionStorage.setItem('fioToUvolnenie', JSON.stringify(fio))
    };

    // получение списка сотрудников, которые не заблокированы и срок увольнения еще не наступил
    const  getNotBlocked = () => {
        return [...Uvolnenie].filter(el=>!el.descrip.toUpperCase().includes('ЗБ') && (dayjs().isAfter(dayjs(el.data_uvol)) || dayjs().isSame(dayjs(el.data_uvol), 'day')))
    }
    // элемент списка сотрудников, которые не заблокированы и срок увольнения еще не наступил
    const renderElementSotrToBlock = (el) => {
        return (
            <Box 
                key={el._id} 
                sx={{
                    bgcolor:'listToBlock.main',
                    borderRadius:'8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: '1px solid',
                    borderColor: 'divider',
                    background: theme.palette.listToBlock.gradient,
                    '&:hover': {
                        opacity: 0.9,
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    },
                    animation: 'pulseIn 0.5s ease-out',
                    '@keyframes pulseIn': {
                        '0%': {
                            opacity: 0,
                            transform: 'scale(0.95)'
                        },
                        '50%': {
                            opacity: 0.5,
                            transform: 'scale(1.05)'
                        },
                        '100%': {
                            opacity: 1,
                            transform: 'scale(1)'
                        }
                    }
                }}
                title="Перейти в Увольнение"
                onClick={() => handleNavigate({fio:el._sotr.fio, prikaz:el.prikaz})}
            >
                <Box sx={{mt:1}} >{el._sotr.fio}</Box>
                <Box color={'primary.main'}>{el.prikaz} | ув. {dayjs(el.data_uvol).format('DD.MM.YYYY')}</Box>
            </Box>
        )
    }
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
                {getNotBlocked() && getNotBlocked().map(el => renderElementSotrToBlock(el))}
            </Box>           
        </Box>
    )
}
