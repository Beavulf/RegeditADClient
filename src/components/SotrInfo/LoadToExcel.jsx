import ExcelJS from 'exceljs';
import { useState, useMemo, useEffect } from 'react';

import { saveAs } from 'file-saver';
import SimCardDownloadIcon from '@mui/icons-material/SimCardDownload';
import { Button, IconButton } from '@mui/material'
import { useSnackbar } from 'notistack';//
import Grow from '@mui/material/Grow';
import { useDialogs } from '@toolpad/core/useDialogs';
import DialogExcel from './DialogExcel.jsx';

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

const ExportExcel = ({ data, tableName }) => {
  const { enqueueSnackbar } = useSnackbar(); 
  const dialogs = useDialogs();

  const exportToExcel = async () => {
    // Создаем новую книгу и рабочий лист
    const workbook = new ExcelJS.Workbook();
    const worksheet =workbook.addWorksheet(`${tableName}`); ;    

    if (data && data.length > 0) {

      const colData = Object.keys(data[0])
      .filter(el => !['_id', '__v', 'is_locked'].includes(el))
      .map(el => {
        let type = undefined;
        if (el.startsWith('data_') || el.startsWith('date_')) {
          type = 'date';
        }
        return { header: el, key: el, type: type };
      });
        
      worksheet.columns = colData;

      // форматируем строку под нужный удобный вид
      data.forEach(item => {
        const resItem = {};
        for (const key in item) {
          if (key.startsWith('data_') || key.startsWith('date_')) {
            resItem[key] = item[key] ? new Date(item[key]) : null;
          } else {
            resItem[key] = item[key];
          }
        }
        resItem._sotr = item._sotr?.fio;
        resItem._otkyda = item._otkyda?.name;
        resItem._kyda = item._kyda?.name;
        resItem._who = item._who?.name;
        resItem._pred_znach = item._pred_znach?.name;
        resItem._new_znach = item._new_znach?.name;
        resItem._pto = item._pto?.name;
        resItem._who_do = item._who_do?.name;

        worksheet.addRow(resItem);
      });

      // Автоматически устанавливаем ширину столбцов исходя из максимальной длины значения
      worksheet.columns.forEach(column => {
        let maxLength = 10;
      
        column.eachCell({ includeEmpty: true }, cell => {
          let value = cell.value;
      
          // Если дата — форматируем по-человечески
          if (value instanceof Date) {
            // Устанавливаем формат Excel-ячейки
            cell.numFmt = 'yyyy-mm-dd hh:mm'; // или 'dd.mm.yyyy'
            value = cell.value = value;
            maxLength = Math.max(maxLength, 16); // фиксированная длина для даты
          } else {
            const text = value ? value.toString() : '';
            maxLength = Math.max(maxLength, text.length);
          }
        });
      
        column.width = maxLength + 2;
      });

      // Выделяем заголовки: задаем для первой строки жирный шрифт и фон
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell(cell => {
        cell.font = { bold: true };
        cell.font.size = 16;
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF808080' }, // желтый фон для заголовков
          
        };
      });

      // Остальные строки
      const dataRows = worksheet.getRows(2, worksheet.rowCount);
      dataRows.forEach(row => {
        row.eachCell(cell => {
          cell.font = { size: 14 }; // увеличенный шрифт остальных строк
          // Форматируем ячейки с датами
          if (cell.type === ExcelJS.ValueType.Date) {
            cell.numFmt = 'dd.mm.yyyy'; // Формат даты
          }
        });
      });
      // Генерируем Excel-файл и запускаем его загрузку
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `${tableName} от ${dayjs(new Date()).format('DD.MM.YYYY')}.xlsx`);
      enqueueSnackbar(`Файл успешно загружен (${tableName}_Archive_${dayjs(new Date()).format('DD.MM.YYYY')}.xlsx).`, { variant: `success` });
    } else {enqueueSnackbar(`Попытка загрузить пустые данные`, { variant: `warning` });}
  };
  // const stableData = useMemo(() => memDatam, [memDatam]);
  // функция вызова окна для выбора дат и столбцов
  // const handleOpenDialog = async () => {
  //   await dialogs.open(DialogExcel, {
  //     data: stableData,
  //     tableName,
  //     onExport: exportToExcel,
  //     onClose: () => dialogs.close() // просто закрываем
  //   });
  // };
  return (
    <Grow in={true} timeout={800}>
      <IconButton 
        title='Загрузить файл' 
        color='info' 
        onClick={exportToExcel}
        sx={{
            color:'primary.main', 
            '&:focus' : {
                outline: 'none'
            },
        }}
    >
        <SimCardDownloadIcon/>
    </IconButton> 
    </Grow>
  );
};

export default ExportExcel;
