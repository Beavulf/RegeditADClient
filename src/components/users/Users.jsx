import { useUsers } from '../../websocket/WebSocketContext.jsx'
import { useMemo } from 'react';
import {DialogEditUsers} from '../Dialog/CustomDialog.jsx';
import MDataGrid from '../DataGrid/MDataGrid.jsx';
import { useTableActions } from '../../websocket/LayoutMessage.jsx';
import './Users.css'

export default function Orders() {
    // вызываем кастомный хук для даления строки из БД
    const { handleDeleteRowBD, handleAddInTable, handleEditRow } = useTableActions();
    const Users = useUsers()
    const columnsUers = useMemo(()=>
        [
            { field: 'is_locked', headerName: 'Locked', width: 150, },
            { field: 'name', headerName: 'Login', width: 150 },
            { field: 'address', headerName: 'Адрес', width: 150 },
            { field: 'role', headerName: 'Роль', flex:1, 
                valueFormatter: (value) => {
                    if (value == null) {
                    return '';
                    }
                    return `${value.toUpperCase()}`;
                }, }
        ],[]
    ) 

    return ( 
        <div className='animated-element'>
            <MDataGrid 
                columns={columnsUers} 
                tableData={Users}
                collectionName={`Users`} 
                actionEdit={(id,oldData,collectionName)=>handleEditRow(id,oldData,collectionName,DialogEditUsers)}
                actionDelete={handleDeleteRowBD}
                actionAdd={()=>handleAddInTable(`Users`,DialogEditUsers)}
            />
        </div>
    )
}