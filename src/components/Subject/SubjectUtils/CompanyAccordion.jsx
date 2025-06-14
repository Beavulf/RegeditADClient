import MDataGrid from '../../DataGrid/MDataGrid.jsx';
import { Accordion, AccordionDetails, AccordionSummary, Typography, Paper } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useCompany } from '../../../websocket/WebSocketContext.jsx'
import { useMemo, memo } from 'react';
import DialogCompany from '../DialogCompany.jsx';
import { useTableActions } from '../../../websocket/LayoutMessage.jsx';

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

const conf = { density: 'compact'}

const columnsCompany =
    [
        { field: 'name', headerName: 'Наименование',flex:0.7},
        { field: 'unp', headerName: 'УНП',flex:0.2},
        { field: 'data_dob', headerName: 'Дата доб.',flex:0.25,
            type: 'date',
            valueGetter: (params) => {
                if (!params) return null;
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
        { field: '_who', headerName: 'Кто доб.',  flex:0.2,
            valueGetter: (params) => params?.name || ''
        }, 
        { field: 'descrip', headerName: 'Описание', width: 150, flex:0.12, },
    ]


const CompanyAccordion = () => {
    const { handleDeleteRowBD, handleAddInTable, handleEditRow } = useTableActions();
    const Company = useCompany();
    
    const companySorted = useMemo(() => {
        return Company.sort((a, b) => dayjs(b.data_dob).valueOf() - dayjs(a.data_dob).valueOf());
    }, [Company]);

    return (
        <Accordion>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="com-accordion"
                sx={{backgroundColor:'#9c92921d'}}
            >
                <Typography color='primary.main' component="span">Список компаний (редактирование, добавление)</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ overflow: 'auto', display: 'block', minHeight:`520px` }}>
                <Paper variant='elevation' elevation={1} sx={{minHeight:`361px`}}>
                    <MDataGrid 
                        conf={conf}
                        tableData={companySorted}
                        columns={columnsCompany} 
                        collectionName={`Company`} 
                        actionEdit={(id,oldData,collectionName)=>handleEditRow(id,oldData,collectionName,DialogCompany)}
                        actionDelete={handleDeleteRowBD}
                        actionAdd={()=>handleAddInTable(`Company`,DialogCompany)}
                    />
                </Paper>
            </AccordionDetails>
        </Accordion>
    )
}

export default memo(CompanyAccordion)