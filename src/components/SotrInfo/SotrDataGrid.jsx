import React, { useEffect, useState } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {Button, Typography, Box, Pagination, PaginationItem} from '@mui/material'

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

export default function SotrInfoDataGrid({columns, data}) {
    const [rows, setRows] = useState([])

    // переписывание строк для указания уникального значения id вместо _id
    useEffect(() => {        
        const newRows = data.map(row => ({
            id: row._id,
            ...row,
        }));

        setRows(newRows);
    }, [data]);
    
    return (
        <DataGrid
            sx={{
                borderTopRightRadius: '0px',
                borderBottomRightRadius: '0px',
                borderTop: '1px solid gray',
                borderLeft: '1px solid gray',
                borderBottom: '1px solid gray',
                transition: 'width 0.3s ease',
            }}
            rows={data}
            getRowId={(row) => row._id}
            columns={columns}
            initialState={{
                pagination: { paginationModel: { pageSize: 5 } },
            }}              
            pageSizeOptions={[5, 10, 25, 50, { value: -1, label: 'Все' }]}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
                toolbar: {
                  showQuickFilter: true,
                },
            }}
        />
    )
}