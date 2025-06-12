import { useMemo } from 'react';
import DialogPerevod from './DialogPerevod.jsx';
import MDataGrid from '../../DataGrid/MDataGrid.jsx';
import { useTableActions } from '../../../websocket/LayoutMessage.jsx';
import { usePerevod } from '../../../websocket/WebSocketContext.jsx'

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

export default function Priem() {
    // вызываем кастомный хук для даления строки из БД
    const { handleDeleteRowBD, handleAddInTable, handleEditRow } = useTableActions();
    const Perevod = usePerevod()
    const columnsPerevod = useMemo(()=>
        [
            { field: '_sotr', headerName: 'ФИО',  flex:0.7,
                valueGetter: (params) => params?.fio || ''
            }, 
            { field: 'prikaz', headerName: 'Приказ',flex:0.3},
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
            { field: 'data_per', headerName: 'Дата перевода',flex:0.3,
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
            { field: '_otkyda', headerName: 'Откуда',  flex:0.3,
                valueGetter: (params) => params?.name || ''
            }, 
            { field: '_kyda', headerName: 'Куда',  flex:0.3,
                valueGetter: (params) => params?.name || ''
            },
            { field: 'data_dob', headerName: 'Дата доб.',flex:0.4,
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
            { field: 'descrip', headerName: 'Описание', width: 150, flex:0.3, },
        ],[]
    ) 

    const filteredPerevod = useMemo(()=>{
        return [...Perevod].sort((a, b) => dayjs(b.data_dob).valueOf() - dayjs(a.data_dob).valueOf())
    },[Perevod])

    return (
        <div className='animated-element'>
            <MDataGrid 
                columns={columnsPerevod} 
                tableData={filteredPerevod}
                collectionName={`Perevod`} 
                actionEdit={(id,oldData,collectionName)=>handleEditRow(id,oldData,collectionName,DialogPerevod)}
                actionDelete={handleDeleteRowBD}
                actionAdd={()=>handleAddInTable(`Perevod`,DialogPerevod)}
            />
        </div>
    )
}