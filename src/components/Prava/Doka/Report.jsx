import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import DownloadIcon from '@mui/icons-material/Download';
import { IconButton } from '@mui/material'
import { useSnackbar } from 'notistack';//
import api from '../../../apiAxios/Api.jsx';
import { memo, useCallback, useMemo } from 'react';

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

const SERVER_ADDRESS = import.meta.env.VITE_SERVER_ADDRESS
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT

const ExportExcel = ({ startDate, endDate }) => {
  const { enqueueSnackbar } = useSnackbar(); 

  const mucol = useMemo(()=>[
    {header:'ПТО', key:'_pto'},
    {header:'ФИО', key:'_sotr'},
    {header:'Тип', key:'type'},
    {header:'ЛНП', key:'lnp'},
    {header:'Обоснование', key:'obosnovanie'},
    {header:'Дата приказа', key:'data_prikaza'},
    {header:'Дата добавления', key:'data_dob'},
    {header:'Кто добавил', key:'_who'},
    {header:'Кто выполнял', key:'_who_do'},
    {header:'Описание', key:'descrip'},
  ],[])

  const exportToExcel = useCallback(async () => {
    // Создаем новую книгу и рабочий лист
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`C ${startDate && dayjs(startDate).format('DD.MM.YYYY') || 'начала'} ПО ${endDate && dayjs(endDate)?.format('DD.MM.YYYY') || 'конец'}`); ;    
    let data;

    async function getAllPdoka(){
      const response = await api.get(`http://${SERVER_ADDRESS}:${SERVER_PORT}/allpdoka`);
      if (response.statusText !== 'OK') {
        throw new Error('Ошибка получения Фидбеков');
      }
      data = await response.data;            
      return;
    }

    await getAllPdoka()

    if (data && data.length > 0) {
      // с и по
      if (startDate && endDate) {
        const startDateObj = dayjs(startDate);
        const endDateObj = dayjs(endDate);
        data = data.filter(item => {
          const itemDate = dayjs(item.data_dob);
          return itemDate.isBetween(startDateObj, endDateObj, 'day', '[]');
        });
      }
      // только С
      if (startDate && !endDate) {        
        const startDateObj = dayjs(startDate);
        data = data.filter(item => {
          const itemDate = dayjs(item.data_dob);
          return itemDate.isAfter(startDateObj, 'day') || itemDate.isSame(startDateObj, 'day');
        });
      }
      // только ПО
      if (!startDate && endDate) {
        const endDateObj = dayjs(endDate);
        data = data.filter(item => {
          const itemDate = dayjs(item.data_dob);
          return itemDate.isBefore(endDateObj, 'day') || itemDate.isSame(endDateObj, 'day');
        });
      }

      worksheet.columns = mucol;

      // Сортировка по data_dob (новые записи сверху)
      data.sort((a, b) => {
        const aDate = dayjs(a.data_dob);
        const bDate = dayjs(b.data_dob);
        return bDate.diff(aDate); // сортировка в обратном порядке (новые - сверху)
      });
      // Добавляем данные в виде строк
      data.forEach(item => {
        const resItem = {
          _pto: item._pto.name,
          _sotr: item._sotr.fio,    
          type: item.type,
          lnp: item.lnp,
          obosnovanie: item.obosnovanie,
          data_prikaza: dayjs(item.data_prikaza).format('DD.MM.YYYY'),
          data_dob: dayjs(item.data_dob).format('DD.MM.YYYY'),
          _who: item._who.name,
          _who_do: item._who_do.name,
          descrip:item.descrip
        }
        worksheet.addRow(resItem);
      });

      // Автоматически устанавливаем ширину столбцов исходя из максимальной длины значения
      worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, cell => {
          const cellValue = cell.value ? cell.value.toString() : '';
          if (cellValue.length > maxLength) {
            maxLength = cellValue.length;
          }
        });
        // Добавляем немного дополнительного пространства для удобства
        column.width = maxLength * 1.5;
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
        });
      });

    }

    // Генерируем Excel-файл и запускаем его загрузку
    if (!data || data.length === 0) {
      enqueueSnackbar(`Нет данных для выгрузки.`, { variant: `error` });
      return;
    }
    
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `DokaNASTD_Archive_${dayjs(new Date()).format('DD.MM.YYYY')}.xlsx`);
    enqueueSnackbar(`Файл успешно загружен (DokaNASTD_Archive_${dayjs(new Date()).format('DD.MM.YYYY')}.xlsx).`, { variant: `success` });
  }, [startDate, endDate, enqueueSnackbar, mucol]);

  return (
    <div>
      <IconButton title='Загрузить файл' color='info' onClick={exportToExcel}><DownloadIcon ></DownloadIcon></IconButton> 
    </div>
  );
};

export default memo(ExportExcel);
