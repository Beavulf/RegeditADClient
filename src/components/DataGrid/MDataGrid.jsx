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
import { useDialogs } from '@toolpad/core/useDialogs';
import groupRows from './DataGridUtils/GroupedRows.js'

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

const storedRole = localStorage.getItem('userRole');

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100, { value: -1, label: 'Все' }];
const COLUMN_VISIBILITY = { _id: false };
const GRID_SLOTS = { toolbar: GridToolbar };
const GRID_SLOT_PROPS = {
  toolbar: { showQuickFilter: true },
  pagination: { ActionsComponent: CustomPagination },
};

const DynamicTable = (({ columns, collectionName, tableData, actionEdit, actionDelete, actionAdd, conf, topSlot, customPageSize }) => {
    const {handleSetBlockedRow } = useTableActions();
    const dialogs = useDialogs();
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

    // функция кнопки для удаления строки, для строк из Доки-множественное удаление
    const handleClickDeleteRow = useCallback(async (id) => {
        try {
            const row = rows.find(row => row.id === id);
            if (!row) return;
            const isDeleted = row.name === 'Удаленный отдел' || row.name === 'Удаленная должность';
            if (isDeleted) {
                enqueueSnackbar('Нельзя.', { variant: 'warning' });
                return;
            }

            handleSetBlockedRow(id, true, collectionName);      
            if (collectionName !== `Pdoka`) {
                actionDelete(id, collectionName, row);
                return;
            }

            const groupedRows = groupRows({row,rows});
            groupedRows.map((row)=>{
                handleSetBlockedRow(row.id,true,`Pdoka`)
            })

            const confirmed = await dialogs.confirm(`Удалить выбранные строки (${groupedRows.length}) ?`, {
                okText: 'Да',
                cancelText: 'Нет',
            });

            await Promise.all(
                groupedRows.map(async (row) => {
                  return confirmed
                    ? actionDelete(row.id, collectionName, row)
                    : handleSetBlockedRow(row.id, false, `Pdoka`);
                })
            );
        } catch (error) {
            console.error('Ошибка при удалении строк:', error);
            handleSetBlockedRow(id, false, collectionName);
            enqueueSnackbar(`Ошибка при удалении - ${error}`, { variant: 'error' });
        }
    }, [rows, actionDelete, collectionName, handleSetBlockedRow, enqueueSnackbar]);

    //доп столбец с кнопками управления: удалить, изменить, разблокировать
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
    const initialState = useMemo(() => ({
        pagination: { paginationModel: { pageSize: customPageSize || 10 } },
    }), [customPageSize]);
      
    const gridSx = useMemo(() => ({
        minHeight: '200px',
        '& .MuiDataGrid-row.selected': rowStyles.selected,
        '& .MuiDataGrid-row.dzgw': rowStyles.dzgw,
        '& .MuiDataGrid-row.certEnd': rowStyles.certEnd,
        '& .MuiDataGrid-row.anull': rowStyles.anull,
    }), [rowStyles]); 

    return (
        <div style={{ width: '100%',overflow: 'hidden', display:'flex', flexDirection:'column',}} className='animated-element'>
            <Box gap={1} sx={{display:`flex`, justifyContent:`space-between`, alignItems:`center`}}>
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
                initialState={initialState}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                rows={memoizedRows}
                columns={columnsExtands}
                rowSelectionModel={selectionModel}
                isRowSelectable={isRowSelectable}
                onRowSelectionModelChange={handleSelectionChange}
                getRowClassName={getRowClassName}
                columnVisibilityModel={COLUMN_VISIBILITY}
                slots={GRID_SLOTS}
                pagination
                sx={gridSx}
                slotProps={GRID_SLOT_PROPS}
                onRowDoubleClick={(params)=>handleClickEditRow(params.id)}
            />
        </div>
    );
});
export default memo(DynamicTable)