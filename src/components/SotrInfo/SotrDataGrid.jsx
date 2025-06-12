import { useEffect, useState, memo } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

function SotrInfoDataGrid({columns, data, loading}) {
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
            loading={loading}
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
                pagination: { paginationModel: { pageSize: 10 } },
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

export default memo(SotrInfoDataGrid)