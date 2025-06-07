import { useMemo } from 'react';
import DialogNaznachenie from './DialogNaznachenie.jsx';
import MDataGrid from '../../DataGrid/MDataGrid.jsx';
import { useTableActions } from '../../../websocket/LayoutMessage.jsx';
import { useNaznachenie } from '../../../websocket/WebSocketContext.jsx'

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

export default function Priem() {
    // вызываем кастомный хук для даления строки из БД
    const { handleDeleteRowBD, handleAddInTable, handleEditRow } = useTableActions();
    const Naznachenie = useNaznachenie()
    const columnsNaznachenie = useMemo(()=>
        [
            { field: '_sotr', headerName: 'ФИО',  flex:0.7,
                valueGetter: (params) => params?.fio || ''
            }, 
            { field: 'prikaz', headerName: 'Приказ',flex:0.3},
            { field: 'data_prikaza', headerName: 'Дата приказа',flex:0.3,
                type: 'date',
                valueGetter: (params) => {
                    const date = dayjs(params);
                      return date.isValid() ? date.toDate() : '--';
                  },
                  renderCell: (params) => {
                    if (params.value) {
                      return dayjs(params.value).format('DD.MM.YYYY');
                    }
                    return null;
                  },
            },
            { field: 'data_nazn', headerName: 'Дата назнач.',flex:0.3,
                type: 'date',
                valueGetter: (params) => {
                    const date = dayjs(params);
                    return date.isValid() ? date.toDate() : '--';
                  },
                  renderCell: (params) => {
                    if (params.value) {
                      return dayjs(params.value).format('DD.MM.YYYY');
                    }
                    return null;
                  },
            },
            { field: '_pred_znach', headerName: 'Пред.',  flex:0.3,
                valueGetter: (params) => params?.name || ''
            }, 
            { field: '_new_znach', headerName: 'Новое',  flex:0.3,
                valueGetter: (params) => params?.name || ''
            },
            { field: 'data_dob', headerName: 'Дата доб.',flex:0.3,
                type: 'date',
                valueGetter: (params) => {
                    const date = dayjs(params);
                    return date.isValid() ? date.toDate() : '--';
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

    const filteredNaznachenie = useMemo(()=>{
        return [...Naznachenie].sort((a, b) => dayjs(b.data_dob).valueOf() - dayjs(a.data_dob).valueOf())
    },[Naznachenie])

    return (
        <div className='animated-element'>
            <MDataGrid 
                columns={columnsNaznachenie} 
                tableData={filteredNaznachenie}
                collectionName={`Naznachenie`} 
                actionEdit={(id,oldData,collectionName)=>handleEditRow(id,oldData,collectionName,DialogNaznachenie)}
                actionDelete={handleDeleteRowBD}
                actionAdd={()=>handleAddInTable(`Naznachenie`,DialogNaznachenie)}
            />
        </div>
    )
}