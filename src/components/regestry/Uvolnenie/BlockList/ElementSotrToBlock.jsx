import { memo } from 'react';
import { Box, useTheme } from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

const ElementSotrToBlock = ({uvolnenie, handleNavigate}) => {
    const theme = useTheme()
    return (
        <Box 
            key={uvolnenie._id} 
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
            onClick={() => handleNavigate({fio:uvolnenie._sotr.fio, prikaz:uvolnenie.prikaz})}
        >
            <Box sx={{mt:1}} >{uvolnenie._sotr.fio}</Box>
            <Box color={'primary.main'}>{uvolnenie.prikaz} | ув. {dayjs(uvolnenie.data_uvol).format('DD.MM.YYYY')}</Box>
        </Box>
    )
}

export default memo(ElementSotrToBlock)