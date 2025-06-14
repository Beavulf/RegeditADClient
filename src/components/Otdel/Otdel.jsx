import { Tabs, Tab } from '@mui/material'
import { useState } from 'react';
import { DialogEditOtdelOrDoljnost } from './DialogEditOtdelOrDoljnost.jsx';
import MDataGrid from '../DataGrid/MDataGrid.jsx';
import { useTableActions } from '../../websocket/LayoutMessage.jsx';
import { useOtdel, useDoljnost } from '../../websocket/WebSocketContext.jsx'

const columnsOtdel = [
    // { field: 'is_locked', headerName: 'Locked', width: 150, },
    { field: 'name', headerName: 'Наименование', width: 200 },
    { field: 'descrip', headerName: 'Описание', flex: 1 }
]
const columnsDoljnost = [
    // { field: 'is_locked', headerName: 'Locked', width: 150, },
    { field: 'name', headerName: 'Наименование', flex: 0.6 },
    { field: 'descrip', headerName: 'Описание', flex: 0.6 }
]

export default function Otdels() {
    const [tabIndex, setTabIndex] = useState(0); // Состояние для вкладок
    const Otdel = useOtdel()
    const Doljnost = useDoljnost()
    // вызываем кастомный хук для удаления строки из БД
    const { handleDeleteRowBD, handleAddInTable, handleEditRow } = useTableActions();

    // переключение вкладок
    const handleTabChange = (event, newIndex) => {
        setTabIndex(newIndex); 
    }

    return (
        <div className='animated-element'>
            {/* Вкладки */}
            <Tabs value={tabIndex} onChange={handleTabChange} centered>
                <Tab label="Отделы" />
                <Tab label="Должности" />
            </Tabs>

            {/* Вкладка для Отделов */}
            {tabIndex === 0 && (
                <div>
                    <MDataGrid
                        columns={columnsOtdel}
                        tableData={Otdel}
                        collectionName={`Otdel`}
                        actionEdit={(id, oldData, collectionName) => handleEditRow(id, oldData, collectionName, DialogEditOtdelOrDoljnost)}
                        actionDelete={handleDeleteRowBD}
                        actionAdd={() => handleAddInTable(`Otdel`, DialogEditOtdelOrDoljnost)}
                    />
                </div>
            )}

            {/* Вкладка для Должностей */}
            {tabIndex === 1 && (
                <div>
                    <MDataGrid
                        columns={columnsDoljnost}
                        tableData={Doljnost}
                        collectionName={`Doljnost`}
                        actionEdit={(id, oldData, collectionName) => handleEditRow(id, oldData, collectionName, DialogEditOtdelOrDoljnost)}
                        actionDelete={handleDeleteRowBD}
                        actionAdd={() => handleAddInTable(`Doljnost`, DialogEditOtdelOrDoljnost)}
                    />
                </div>
            )}
        </div>
    )
}
