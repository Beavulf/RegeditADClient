import { memo, useState } from 'react';
import { Box, Typography, Button, Divider, Tooltip } from '@mui/material';
import { useWebSocketContext } from '../../../../websocket/WebSocketContext';
import { useSnackbar } from 'notistack';
import GetProgrammsInfo from './GetProgrammsInfo';
import DialogProgrammsInfo from './DialogProgrammsInfo';
import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

const ElementSotrToBlock = ({uvolnenie, handleNavigate}) => {
    const {enqueueSnackbar} = useSnackbar();
    const {sendJsonMessage} = useWebSocketContext();
    const [dialogOpen, setDialogOpen] = useState(false);
    const programmsInfo = GetProgrammsInfo(uvolnenie?._sotr?._id) || {};
    
    const updateUvolnenieById = async (id, newData) => {
        const message = {
            type: 'updateInCollection',
            data: {
                collection: 'Uvolnenie',
                filter: { _id: id },
                value: {
                    ...newData,
                    is_locked: false
                }
            }
        };
        await sendJsonMessage(message);
        enqueueSnackbar('Задача отмечена как выполненная', { variant: 'success' });
    };

    const handleGetProgrammsInfo = () => {
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    return (
        <Box 
            key={uvolnenie._id} 
            padding={'0 5px'}
            sx={{
                bgcolor:'listToBlock.main',
                borderRadius:'8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: '1px solid',
                borderColor: 'divider',
                background: 'listToBlock.gradient',
                '&:hover': {
                    opacity: 0.9,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    backgroundColor:'rgba(56, 51, 51, 0.15)'
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
            justifyContent={'space-between'}
            alignItems={'center'}
            display={'flex'}
            flexDirection={'row'}
        >
            <Box display={'flex'} flexDirection={'column'} flex={1} sx={{borderRight:'1px solid', borderColor:'divider'}}
                onClick={() => handleNavigate({fio:uvolnenie._sotr.fio, prikaz:uvolnenie.prikaz})}
                title="Перейти в Увольнение"
            >
                <Typography sx={{mt:1, p:'5px'}} fontSize={'14px'}>{uvolnenie._sotr.fio}</Typography>
                <Typography color={'primary.main'}>{uvolnenie.prikaz} | ув. {dayjs(uvolnenie.data_uvol).format('DD.MM.YYYY')}</Typography>
            </Box>
            <Box sx={{margin:0, padding:0, width:'60px'}}>
                <Tooltip title='(ТЕСТОВАЯ) Информация о программах, где необходимо заблокировать сотрудника' placement='top' arrow followCursor>
                    <Button
                        onClick={handleGetProgrammsInfo}
                    >инф.
                    </Button>
                </Tooltip>
                <Divider/>
                <Tooltip title='Отметить выполнение задачи' placement='top' arrow followCursor>
                    <Button 
                        onClick={()=>updateUvolnenieById(uvolnenie._id, {descrip: 'зб'})}
                        >вып.
                    </Button>
                </Tooltip>
            </Box>
            <DialogProgrammsInfo 
                open={dialogOpen}
                onClose={handleCloseDialog}
                payload={programmsInfo}
            />
        </Box>
    )
}

export default memo(ElementSotrToBlock)