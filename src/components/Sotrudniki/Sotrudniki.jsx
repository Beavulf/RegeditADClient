import React, { useMemo, useCallback, useState  } from 'react';
import DialogAddSotrudnik from './DialogSotrudnik.jsx';
import MDataGrid from '../DataGrid/MDataGrid.jsx';
import { useTableActions } from '../../websocket/LayoutMessage.jsx';
import { useSotrudnik  } from '../../websocket/WebSocketContext.jsx'
import { Button, Typography } from '@mui/material'
import * as xlsx from 'xlsx'
import { useOtdel, useDoljnost,  useWebSocketContext } from '../../websocket/WebSocketContext.jsx'

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

const Sotrudniki = React.memo(function Sotrudniki() {
    // вызываем кастомный хук для даления строки из БД
    const { handleDeleteRowBD, handleAddInTable, handleEditRow } = useTableActions();
    const Otdel = useOtdel()
    const Sotrudnik = useSotrudnik()
    const Doljnost = useDoljnost();
    const {sendJsonMessage} = useWebSocketContext()
    const columnsSotrudniki = useMemo(()=>
        [
            { field: 'lnp', headerName: 'ЛНП',flex:0.15},
            { field: 'fio', headerName: 'ФИО',flex:0.7},
            { field: '_doljnost', headerName: 'Должность',  flex:0.5,
                valueGetter: (params) => params?.name || ''
            },  
            { field: '_otdel', headerName: 'Отдел', flex:0.3,
                valueFormatter:(params) => params?.name || ''
            },
            { field: 'phone', headerName: 'Телефон', flex:0.2,},
            { field: 'login', headerName: 'DNS', width: 150, flex:0.3, },
            { field: 'descrip', headerName: 'Описание', width: 150, flex:0.3, },
        ],[]
    ) 

    const memoizedHandleEditRow = useCallback((id, oldData, collectionName) => {
        handleEditRow(id, oldData, collectionName, DialogAddSotrudnik);
     }, [handleEditRow]);
    
    //загрузка файла excel для импорта массива данных
    // const [fileContent, setFileContent] = useState([]);
    // const handleFileUpload = (event) => {
    //     const file = event.target.files[0];
    //     if (!file) return;

    //     const reader = new FileReader();

    //     reader.onload = (e) => {
    //         const data = new Uint8Array(e.target.result);
    //         const workbook = xlsx.read(data, { type: "array", });
    //         const sheetName = workbook.SheetNames[0];
    //         const worksheet = workbook.Sheets[sheetName];
    //         const jsonData = xlsx.utils.sheet_to_json(worksheet);

    //         console.log("Массив из Excel:", jsonData);
    //         setFileContent(jsonData);
    //     };

    //     reader.readAsArrayBuffer(file);
    // };

    // // запись полученых контрактов в нормальзованный вид для БД и запись в БД
    // async function getSotrudnik() {
    //     fileContent.forEach(async (sotr,index)=>{
    //         const message = {
    //             type: 'insertInToCollection',
    //             data: {
    //             collection: 'Sotrudnik',
    //             body: {
    //                 _otdel: Otdel.find(el=>el.name === sotr.otdel.trim() || el.descrip === sotr.otdel.trim())?._id || console.log(`OTDEL-------${index}`),
    //                 _doljnost: Doljnost.find(el=>el.name === sotr.doljnost.trim())?._id || console.log(`DOLJNoST-------${index}`),
    //                 fio:sotr.fio,
    //                 phone:'',
    //                 login: sotr.login.trim(),
    //                 lnp:sotr.lnp != 0 ? sotr.lnp : null,
    //                 descrip: sotr.descrip,
    //                 is_locked: false,
    //             },
    //             },
    //         };
            
    //         await sendJsonMessage(message)
    //     })
    // }
    return (
        <div className='animated-element'>
            {/* <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
            <Button onClick={getSotrudnik}>LOAD</Button> */}
            <MDataGrid 
                columns={columnsSotrudniki} 
                tableData={Sotrudnik}
                collectionName={`Sotrudnik`} 
                actionEdit={memoizedHandleEditRow}
                actionDelete={handleDeleteRowBD}
                actionAdd={()=>handleAddInTable(`Sotrudnik`,DialogAddSotrudnik)}
            />
            <Typography variant='body2' color='gray'>* приудалении сотрудника, удаляются все данные связанный с ним.</Typography>
        </div>
    )
})
Sotrudniki.displayName = 'Sotrudniki'
export default React.memo(Sotrudniki)