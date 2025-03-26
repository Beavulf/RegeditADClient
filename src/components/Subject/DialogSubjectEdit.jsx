import { useSubject } from '../../websocket/WebSocketContext.jsx'
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography} from '@mui/material';
import { useMemo } from 'react';
import MDataGrid from '../DataGrid/MDataGrid.jsx';
import { useTableActions } from '../../websocket/LayoutMessage.jsx';
import DialogSubject from './DialogSubject.jsx';
import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

export default function DialogSubjectEdit({ payload, open, onClose }) {
    const { handleDeleteRowBD, handleAddInTable, handleEditRow } = useTableActions();
    const Subject = useSubject()
    const conf = useMemo(() => ({ density: 'compact', }), []);
    const columnsSubject = useMemo(()=>
        [
            { field: 'name', headerName: 'ФИО',flex:0.5},
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
            { field: '_who', headerName: 'Кто доб.',  flex:0.2,
                valueGetter: (params) => params?.name || ''
            }, 
            { field: 'descrip', headerName: 'Описание', width: 150, flex:0.12, },
        ],[]) 

    return (
        <Dialog open={open} onClose={() => onClose()} maxWidth={`600px`}>
        <DialogTitle>Редактирование компаний:</DialogTitle>
        <DialogContent sx={{margin:'0', padding:'0 10px'}}>       
            <MDataGrid 
                conf={conf}
                columns={columnsSubject} 
                tableData={Subject}
                collectionName={`Subject`} 
                actionEdit={(id,oldData,collectionName)=>handleEditRow(id,oldData,collectionName,DialogSubject)}
                actionDelete={handleDeleteRowBD}
                actionAdd={()=>handleAddInTable(`Subject`,DialogSubject)}
            />
            <Typography variant='b2' color='gray' sx={{margin:'0', padding:'0'}}>
                *при удалени СУБЪЕКТА, удалятся все связанные с ним контракты и продления.
            </Typography>
        </DialogContent>

        <DialogActions>
            <Button
            onClick={async () => {         
                onClose();                
            }}
            >
            OK
            </Button>
        </DialogActions>

        </Dialog>
    );
}
