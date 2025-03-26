import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { DataGrid, GridToolbar, GridPagination, useGridApiContext, useGridSelector, gridPageSelector, gridPageCountSelector  } from '@mui/x-data-grid';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {Button, Typography, Box, Pagination, PaginationItem} from '@mui/material'
import { GridActionsCellItem  } from '@mui/x-data-grid'
import { useTableActions } from '../../websocket/LayoutMessage.jsx';
import isEqual from 'lodash/isEqual';
import './MDataGrid.css'
import '../../App.css'

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');
const storedRole = localStorage.getItem('userRole');
function CustomPagination() {
    const apiRef = useGridApiContext();
    const page = useGridSelector(apiRef, gridPageSelector);
    const pageCount = useGridSelector(apiRef, gridPageCountSelector);
  
    const handleFirstPage = () => {
      apiRef.current.setPage(0);
    };
  
    const handleLastPage = () => {
      apiRef.current.setPage(pageCount - 1);
    };
  
    const handlePageChange = (event, value) => {
      apiRef.current.setPage(value - 1);
    };
  
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding:'0 5px'}}>
        <Button onClick={handleFirstPage} disabled={page === 0}>
          start
        </Button>
        <Pagination
            color="primary"
            count={pageCount}
            page={page + 1}
            onChange={handlePageChange}
            sx={{display: 'flex', alignItems: 'center' }}
            renderItem={(item) =>
                item.type === 'previous' || item.type === 'next' ? (
                <PaginationItem {...item} />
                ) : (
                null
                )
            }
        />
        <Button onClick={handleLastPage} disabled={page >= pageCount - 1}>
          end
        </Button>
      </Box>
    );
}

const DynamicTable = (({ columns, collectionName, tableData, actionEdit, actionDelete, actionAdd, filters, conf }) => {
    const {handleSetBlockedRow } = useTableActions();
    const [rows, setRows] = useState([]);
    const [selectionModel, setSelectionModel] = useState([]);
    const [originalRows, setOriginalRows] = useState([]);
    const [blockID, setBlockID] = useState(() => 
        rows.filter(row => row.is_locked === true).map(row => row.id)
    );
    const rowsRef = useRef(rows);

    // Обновление строк таблицы при изменении socketData
    useEffect(() => {        
        const newRows = tableData.map(row => ({
            id: row._id,
            ...row,
        }));
    
        if (!isEqual(newRows, rowsRef.current)) {
            rowsRef.current = newRows;
            setTimeout(() => {
                setRows(newRows);
                setOriginalRows(newRows);
            }, 0);
        }
    }, [tableData]);

    // фильтрация строк
    useEffect(() => {
        if (!filters || Object.keys(filters).length === 0) {
            if (!isEqual(rows, originalRows)) setRows(originalRows);
            return;
        }
    
        setTimeout(() => {
            const filteredRows = originalRows.filter(row =>
                Object.entries(filters).every(([column, value]) => {
                    if (!value) return true;
                    if (column === '_subj') return row._subj && row._subj._id === value;
                    if (column === '_contr') return row._contr && row._contr._id === value;
                    return typeof row[column] === 'string'
                        ? row[column].toLowerCase().includes(value.toLowerCase())
                        : row[column] === value;
                })
            );
    
            if (!isEqual(rows, filteredRows)) setRows(filteredRows);
        }, 0);
    }, [filters, originalRows]);

    //получение массива id блокированных строк 
    useEffect(() => {
        const newBlockID = rows.filter(row => row.is_locked).map(row => row.id);
        if (!isEqual(newBlockID, blockID)) {setTimeout(() => setBlockID(newBlockID), 0);}
    }, [rows]);

    //отмена выбора строки с блоком
    const handleSelectionChange = useCallback((newSelection) => {              
        setSelectionModel(newSelection);   
    }, []);

    const isRowSelectable = useCallback((params) => {
        return !blockID.includes(params.id);
    }, [blockID]);

    //классы для покраски строк
    const rowClasses = useMemo(() => {
        const map = new Map();
        rows.forEach(row => {
            let className = '';

            // Проверка is_locked
            if (row.is_locked) {
                className = 'selected-row';
            }
            // Проверка obosnovanie
            else if (row.obosnovanie === 'ДЗ по GW') {
                className = 'dzgw';
            }
            // Проверка data_cert
            else if (row.data_cert && new Date(row.data_cert) < new Date()) {
                className = 'subject-cert-end'; // Дата истекла
            }

            map.set(row.id, className);
        });
        return map;
      }, [rows]);
    
    //доп столбец с кнопками управления
    const actionsColumn = useMemo(() => ({
        field: `actions`,
        headerName: 'Действия',
        type: `actions`,
        cellClassName: `actions`,
        getActions: ({ id }) => {
            if (blockID.includes(id)) {
                return [
                    storedRole === `admin` ? (
                        <GridActionsCellItem
                            key={id}
                            icon={<CloseIcon />}
                            label="Uncheck"
                            title='Отменить редактирование'
                            sx={{ color: 'primary.main' }}
                            onClick={async () => {
                                handleSetBlockedRow(id, false, collectionName);
                            }}
                        />
                    ) : (
                        <Typography key={id}>BLOCKED</Typography>
                    ),
                ];
            }
            return [
                <GridActionsCellItem
                    key={id}
                    icon={<EditIcon />}
                    label="Edit"
                    title='Изменить в БД'
                    sx={{ color: 'primary.main' }}
                    onClick={async () => {
                        const row = rows.find(row => row.id === id); // Оптимизация: поиск строки один раз
                        if (row.name === `Удаленный отдел` || row.name === `Удаленная должность`) {
                            alert(`Нельзя`);
                            return;
                        }
                        try{
                          await actionEdit(id, row, collectionName)
                          return
                        }
                        catch(e){
                          console.error('Error in edit action', e)
                        }
                    }}
                />,
                <GridActionsCellItem
                    key={id}
                    icon={<DeleteIcon />}
                    label="Delete"
                    title='Удалить из БД'
                    sx={{ color: 'primary.main' }}
                    onClick={async () => {
                        const row = rows.find(row => row.id === id); // Оптимизация: поиск строки один раз
                        if (row.name === `Удаленный отдел` || row.name === `Удаленная должность`) {
                            alert(`Нельзя`);
                            return;
                        }
                        handleSetBlockedRow(id, true, collectionName);
                        try{
                          await actionDelete(id, collectionName, row);
                        }
                        catch(e){
                          console.error('Error in delete action', e)
                          handleSetBlockedRow(id, false, collectionName);
                        }
                    }}
                />,
            ];
        },
    }), [blockID, rows, storedRole, actionEdit, actionDelete, collectionName]);

    //добавление к передаваемым столбцам столбец с кнопками
    const columnsExtands = useMemo(() => [...columns, actionsColumn], [columns, actionsColumn]);
    const memoizedRows = useMemo(() => rows, [rows]);
    
    return (
        <div style={{ width: '100%',overflow: 'hidden', display:'flex', flexDirection:'column',}} className='animated-element'>

            <Box sx={{display:`flex`, justifyContent:`space-between`,}}>
                <Box>

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
                sx={{
                    minHeight: `200px`,
                }}
                initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                }}              
                pageSizeOptions={[5, 10, 25, 50, 100, { value: -1, label: 'Все' }]}
                rows={memoizedRows} 
                columns={columnsExtands} 
                rowSelectionModel={selectionModel}  // список выделенных строк
                isRowSelectable={isRowSelectable}
                onRowSelectionModelChange={handleSelectionChange} //колбек при выборе строки
                getRowClassName={({ row }) => rowClasses.get(row.id) || ''}
                columnVisibilityModel={{_id:false}}
                slots={{ toolbar: GridToolbar }}
                pagination
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

export default (DynamicTable)