import { useMemo } from 'react';
import DialogSbrosAD from './DialogSbrosAD.jsx';
import MDataGrid from '../../DataGrid/MDataGrid.jsx';
import { useTableActions } from '../../../websocket/LayoutMessage.jsx';
import { useSbrosAD } from '../../../websocket/WebSocketContext.jsx'
import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

export default function SbrosAD() { 
    // вызываем кастомный хук для даления строки из БД
    const { handleDeleteRowBD, handleAddInTable, handleEditRow } = useTableActions();
    const SbrosAD = useSbrosAD();
    
    const columnsSbrosAD = useMemo(()=>
        [
            { field: '_otdel', headerName: 'Отдел',  flex:0.17,
                valueGetter: (params) => params?.name || ''
            },
            { field: '_sotr', headerName: 'ФИО',  flex:0.4,
                valueGetter: (params) => params?.fio || ''
            }, 
            { field: 'action', headerName: 'Приказ',flex:0.3},
            { field: 'data', headerName: 'Дата вып.',flex:0.2,
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
            { field: '_who_do', headerName: 'Кто вып.',  flex:0.2,
                valueGetter: (params) => params?.name || ''
            }, 
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
        ],[]
    ) 

    const filteredSbrosAD = useMemo(()=>{
        return SbrosAD.sort((a, b) => dayjs(b.data_dob).valueOf() - dayjs(a.data_dob).valueOf())
    },[SbrosAD])

    return (
        <div className='animated-element'>
            <MDataGrid 
                columns={columnsSbrosAD} 
                tableData={filteredSbrosAD}
                collectionName={`SbrosAD`} 
                actionEdit={(id,oldData,collectionName)=>handleEditRow(id,oldData,collectionName,DialogSbrosAD)}
                actionDelete={handleDeleteRowBD}
                actionAdd={()=>handleAddInTable(`SbrosAD`,DialogSbrosAD)}
            />
        </div>
    )
}