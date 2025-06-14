import { useEffect, useState, useMemo, useCallback, useRef, memo } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Button, Typography, Box } from '@mui/material'
import { GridActionsCellItem  } from '@mui/x-data-grid'
import { useTableActions } from '../../websocket/LayoutMessage.jsx';
import isEqual from 'lodash/isEqual';
import './MDataGrid.css'
import '../../App.css'
import getRowStyles from './rowStyles.jsx';
import { useTheme } from '@mui/material/styles';
import CustomPagination from './DataGridUtils/CustomPagination.jsx';
import { useSnackbar } from 'notistack';

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

const storedRole = localStorage.getItem('userRole');

const DynamicTable = (({ columns, collectionName, tableData, actionEdit, actionDelete, actionAdd, conf, topSlot }) => {
    const {handleSetBlockedRow } = useTableActions();
    const [rows, setRows] = useState([]);
    const [selectionModel, setSelectionModel] = useState([]);

    const { enqueueSnackbar } = useSnackbar(); 

    const rowsRef = useRef(rows);
    const theme = useTheme();

    // Обновление строк таблицы при изменении socketData
    useEffect(() => {        
        const newRows = tableData.map(row => ({
            id: row._id,
            ...row,
        }));
    
        if (!isEqual(newRows, rowsRef.current)) {
            rowsRef.current = newRows;
            setRows(newRows);
        }
    }, [tableData]);

    //получение массива id блокированных строк 
    const blockID = useMemo(() => 
        rows.filter(row => row.is_locked).map(row => row.id),
        [rows]
    );

    //отмена выбора строки с блоком
    const handleSelectionChange = useCallback((newSelection) => {              
        setSelectionModel(newSelection);   
    }, []);

    const isRowSelectable = useCallback((params) => {
        return !blockID.includes(params.id);
    }, [blockID]);

    //классы для покраски строк
    const rowStyles = useMemo(() => getRowStyles(theme), [theme]);
    const getRowClassName = useCallback(({ row }) => {
        if (row.is_locked) return 'selected';
        if (row.obosnovanie === 'ДЗ по GW') return 'dzgw';
        if (row.data_cert && new Date(row.data_cert) < new Date() && !row.anull) return 'certEnd';
        if (row.anull) return 'anull';
        return '';
    }, []);
    
    // функция кнопки для редактирования строки
    const handleClickEditRow = useCallback(async (id) => {
        const row = rows.find(row => row.id === id);
        if (!row) return;
        const isDeleted = row.name === 'Удаленный отдел' || row.name === 'Удаленная должность';
        if (isDeleted) {
            enqueueSnackbar('Нельзя.', { variant: 'warning' });
            return;
        }
        try {
            await actionEdit(id, row, collectionName);
        } catch (error) {
            enqueueSnackbar(`Ошибка запроса к серверу - ${error}`, { variant: 'error' });
            console.error('Error in edit action:', error);
        }
    }, [rows, actionEdit, collectionName, enqueueSnackbar]);

    // функция кнопки для удаления строки
    const handleClickDeleteRow = useCallback(async (id) => {
        const row = rows.find(row => row.id === id);
        if (!row) return;
        const isDeleted = row.name === 'Удаленный отдел' || row.name === 'Удаленная должность';
        if (isDeleted) {
            enqueueSnackbar('Нельзя.', { variant: 'warning' });
            return;
        }
        handleSetBlockedRow(id, true, collectionName);
        try {
            await actionDelete(id, collectionName, row);
        } catch (error) {
            console.error('Error in delete action:', error);
            handleSetBlockedRow(id, false, collectionName);
            enqueueSnackbar(`Ошибка при удалении - ${error}`, { variant: 'error' });
        }
    }, [rows, actionDelete, collectionName, handleSetBlockedRow, enqueueSnackbar]);

    //доп столбец с кнопками управления
    const actionsColumn = useMemo(() => ({
        field: 'actions',
        headerName: 'Действия',
        type: 'actions',
        cellClassName: 'actions',
        getActions: ({ id }) => {
            const isBlocked = blockID.includes(id);
            const isAdmin = storedRole === 'admin';
            if (isBlocked) {
                return [
                    isAdmin ? (
                        <GridActionsCellItem
                            key={id}
                            icon={<CloseIcon />}
                            label="Uncheck"
                            title='Отменить редактирование'
                            sx={{ color: 'primary.main' }}
                            onClick={() => handleSetBlockedRow(id, false, collectionName)}
                        />
                    ) : (
                        <Typography key={id}>BLOCKED</Typography>
                    ),
                ];
            }
            const actionButtons = [
                <GridActionsCellItem
                    key={`edit-${id}`}
                    icon={<EditIcon />}
                    label="Edit"
                    title='Изменить в БД'
                    sx={{ color: 'primary.main' }}
                    onClick={() => handleClickEditRow(id)}
                />,
                <GridActionsCellItem
                    key={`delete-${id}`}
                    icon={<DeleteIcon />}
                    label="Delete"
                    title='Удалить из БД'
                    sx={{ color: 'primary.main' }}
                    onClick={() => handleClickDeleteRow(id)}
                />,
            ];

            return actionButtons;
        },
    }), [blockID, storedRole, handleSetBlockedRow, handleClickEditRow, handleClickDeleteRow, collectionName]);

    //добавление к передаваемым столбцам столбец с кнопками
    const columnsExtands = useMemo(() => [...columns, actionsColumn], [columns, actionsColumn]);
    const memoizedRows = useMemo(() => rows, [rows]);
    
    return (
        <div style={{ width: '100%',overflow: 'hidden', display:'flex', flexDirection:'column',}} className='animated-element'>
            <Box sx={{display:`flex`, justifyContent:`space-between`, alignItems:`center`}}>
                <Box sx={{display:`flex`, alignItems:`center`, height:'100%', flex:1}}>
                    {topSlot}
                </Box>
                <Button 
                    title='Добавить в БД' 
                    sx={{margin:'5px 0'}} 
                    variant='contained'
                    onClick={actionAdd}
                    >добавить
                </Button>
            </Box>
            <DataGrid 
                {...conf}
                disableVirtualization={false}
                initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                }}              
                pageSizeOptions={[5, 10, 25, 50, 100, { value: -1, label: 'Все' }]}
                rows={memoizedRows} 
                columns={columnsExtands} 
                rowSelectionModel={selectionModel}  // список выделенных строк
                isRowSelectable={isRowSelectable}
                onRowSelectionModelChange={handleSelectionChange} //колбек при выборе строки
                getRowClassName={getRowClassName}
                columnVisibilityModel={{_id:false}}
                slots={{ toolbar: GridToolbar }}
                pagination
                sx={{
                    minHeight: `200px`,
                    '& .MuiDataGrid-row.selected': rowStyles.selected,
                    '& .MuiDataGrid-row.dzgw': rowStyles.dzgw,
                    '& .MuiDataGrid-row.certEnd': rowStyles.certEnd,
                    '& .MuiDataGrid-row.anull': rowStyles.anull,
                }}
                slotProps={{
                    toolbar: {
                      showQuickFilter: true,
                    },
                    pagination: {ActionsComponent:CustomPagination}
                }}
            />
        </div>
    );
})

export default memo(DynamicTable)