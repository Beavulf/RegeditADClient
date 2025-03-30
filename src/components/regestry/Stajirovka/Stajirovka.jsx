import { useMemo } from 'react';
import DialogStajirovka from './DialogStajirovka.jsx';
import MDataGrid from '../../DataGrid/MDataGrid.jsx';
import { useTableActions } from '../../../websocket/LayoutMessage.jsx';
import { useStajirovka } from '../../../websocket/WebSocketContext.jsx'

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

export default function Stajirovka() {
    // вызываем кастомный хук для даления строки из БД
    const { handleDeleteRowBD, handleAddInTable, handleEditRow } = useTableActions();
    const Stajirovka = useStajirovka()
    const columnsStajirovka = useMemo(()=>
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
            { field: 'data_n', headerName: 'Дата начала',flex:0.3,
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
            { field: 'data_k', headerName: 'Дата окончания',flex:0.3,
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

    return (
        <div className='animated-element'>
            <MDataGrid 
                columns={columnsStajirovka} 
                tableData={Stajirovka.sort((a, b) => dayjs(b.data_dob).valueOf() - dayjs(a.data_dob).valueOf())}
                collectionName={`Stajirovka`} 
                actionEdit={(id,oldData,collectionName)=>handleEditRow(id,oldData,collectionName,DialogStajirovka)}
                actionDelete={handleDeleteRowBD}
                actionAdd={()=>handleAddInTable(`Stajirovka`,DialogStajirovka)}
            />
        </div>
    )
}