import { useMemo, useRef } from 'react';
// import DialogSvodka from './DialogSvodka.jsx';
import MDataGrid from '../../DataGrid/MDataGrid.jsx';
import { useTableActions } from '../../../websocket/LayoutMessage.jsx';
import { useAPS2020, useSotrudnik, useUsers, useWebSocketContext } from '../../../websocket/WebSocketContext.jsx';
import { Box, Button } from '@mui/material';
import DialogAPS2020 from './DialogAPS2020.jsx';
import dayjs from 'dayjs';
import 'dayjs/locale/ru'
import { useSnackbar } from 'notistack';
import ExcelJS from 'exceljs';
import getWhoId from '../../users/GetWhoID.jsx';
dayjs.locale('ru');
export default function APS2020() {
    // вызываем кастомный хук для даления строки из БД
    const { handleDeleteRowBD, handleAddInTable, handleEditRow } = useTableActions();
    const APS2020 = useAPS2020();
    const Sotrudnik = useSotrudnik();
    const Users = useUsers();
    const { enqueueSnackbar } = useSnackbar();
    const { sendJsonMessage } = useWebSocketContext();
    const fileInputRef = useRef(null);

    const columnsAPS2020 = useMemo(()=>
        [
            { field: '_sotr', headerName: 'ФИО',  flex:0.5,
                valueGetter: (params) => params?.fio || ''
            }, 
            { field: 'prikaz', headerName: 'Приказ(ДЗ)', flex:0.3},
            { field: 'data_prikaza', headerName: 'Дата приказа(ДЗ)',flex:0.3,
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
            { field: 'prava', headerName: 'Права доступа', flex:0.5},
            { field: 'data_dob', headerName: 'Дата доб.',flex:0.3,
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
    );

    const sortAPS2020 = useMemo(()=>{
        return APS2020.sort((a, b) => dayjs(b.data_dob).valueOf() - dayjs(a.data_dob).valueOf());
    },[APS2020]);


    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const reader = new FileReader();

        reader.readAsArrayBuffer(file);
        reader.onload = async () => {
            try {
                const buffer = reader.result;
                await workbook.xlsx.load(buffer);
                const worksheet = workbook.getWorksheet(1);

                const toAdd = [];
                const notFound = [];

                const sotrudnikMap = new Map(Sotrudnik.map(s => [String(s.lnp).trim(), s._id]));
                const whoId = getWhoId(null, Users);

                worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                    if (rowNumber === 1) { // Пропускаем заголовок
                        return;
                    }

                    const fio = row.values[1];
                    const lnp = row.values[3] ? String(row.values[3]).trim() : null;
                    const prava = row.values[4];
                    
                    if (!lnp) {
                        notFound.push({ fio: fio || 'N/A', lnp: 'пусто' });
                        return;
                    }

                    const sotrudnikId = sotrudnikMap.get(lnp);

                    if (sotrudnikId) {
                        toAdd.push({
                            _sotr: sotrudnikId,
                            prikaz: 'из АПС',
                            data_prikaza: dayjs(new Date()).toISOString(),
                            prava: prava || 'нет',
                            descrip: '',
                            _who: whoId,
                            data_dob: dayjs(new Date()).toISOString(),
                            is_locked: false,
                        });
                    } else {
                        notFound.push({ fio, lnp });
                    }
                });

                if (toAdd.length > 0) {
                    const message = {
                        type: 'insertInToCollection',
                        data: {
                            collection: 'APS2020',
                            body: toAdd,
                        },
                    };
                    sendJsonMessage(message);
                    enqueueSnackbar(`Успешно добавлено ${toAdd.length} записей.`, { variant: 'success' });
                }

                if (notFound.length > 0) {
                    const notFoundContent = notFound.map(item => `ФИО: ${item.fio || '(нет ФИО)'}, ЛНП: ${item.lnp}`).join('\n');
                    const blob = new Blob([notFoundContent], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Не_найденные_сотрудники_${dayjs().format('YYYYMMDD_HHmmss')}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    enqueueSnackbar(
                        `Не найдены сотрудники с ЛНП. Список сохранен в файл: ${a.download}`,
                        { variant: 'warning', autoHideDuration: 10000 });
                }

                if (toAdd.length === 0 && notFound.length === 0) {
                    enqueueSnackbar('Не найдено записей для добавления в файле.', { variant: 'info' });
                }

            } catch (error) {
                console.error("Ошибка при чтении файла Excel:", error);
                enqueueSnackbar(`Ошибка при чтении файла: ${error.message}`, { variant: 'error' });
            } finally {
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        };
        reader.onerror = (error) => {
            console.error("Ошибка при чтении файла:", error);
            enqueueSnackbar('Ошибка при чтении файла.', { variant: 'error' });
        };
    };

    return (
        <div className='animated-element'>
            <MDataGrid 
                topSlot={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Button variant="outlined" onClick={() => fileInputRef.current.click()}>
                            Импорт из Excel
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            accept=".xlsx, .xls"
                        />
                    </Box>
                }
                columns={columnsAPS2020} 
                tableData={sortAPS2020}
                collectionName={`APS2020`} 
                actionEdit={(id,oldData,collectionName)=>handleEditRow(id,oldData,collectionName,DialogAPS2020)}
                actionDelete={handleDeleteRowBD}
                actionAdd={()=>handleAddInTable(`APS2020`,DialogAPS2020)}
            />
        </div>
    )
}