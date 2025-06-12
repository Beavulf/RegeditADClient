import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { Box } from '@mui/material';
import { useDialogs } from '@toolpad/core/useDialogs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useCompany, useProdlenie, useContract } from '../../websocket/WebSocketContext.jsx'
import ExcelJS from 'exceljs';
import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

export default function DialogReport({ open, onClose }) {
    const Contract = useContract()
    const Prodlenie = useProdlenie()
    const Company = useCompany()
    const { enqueueSnackbar } = useSnackbar(); 

    const [dateS, setDateS] = useState(dayjs(new Date()));
    const [dateP, setDateP] = useState(dayjs(new Date()));

    //получение ежеденевного отчета и новых или измененных контрактах
    function handleGetReportToAdd(dateS, dateP) {
        const newContract = Contract.filter(el=>{
            if (!el.data_dob) return false;

            const dataDob = dayjs(el.data_dob);
            const dateCertifEdit = dayjs(el.certif_edit || null)
            const startDay = dayjs(dateS);
            const endDay = dayjs(dateP);
            
            return (
                (
                    dataDob.isSame(startDay, 'day') || dataDob.isSame(endDay, 'day') ||
                    (dataDob.isAfter(startDay) && dataDob.isBefore(endDay))
                ) || 
                (
                    dateCertifEdit.isSame(startDay, 'day') || dateCertifEdit.isSame(endDay, 'day') ||
                    (dateCertifEdit.isAfter(startDay) && dateCertifEdit.isBefore(endDay))
                )
            ) && el.anull!=true;
        })
        return newContract
    }

    // получение контрактов по последнему проблению
    function handleGetReportToRenew(dateS, dateP){
        const newProdlenie = Prodlenie.filter(el=>{
            if (!el.data_dob) return false;

            const dataDob = dayjs(el.data_dob);
            const startDay = dayjs(dateS);
            const endDay = dayjs(dateP);
            
            return dataDob.isSame(startDay, 'day') || dataDob.isSame(endDay, 'day') ||
            (dataDob.isAfter(startDay) && dataDob.isBefore(endDay))
        })
        const uniqContr = [...new Set(newProdlenie.map(el => el._contr._id))];
        const newContractToRenew = Contract.filter(el=>(uniqContr.includes(el._id) && el.anull!=true))
        return newContractToRenew
    }

    // получение аннулированных контрактов за период
    function handleGetAnullContr(dateS, dateP) {
        const anullContr = Contract.filter(el=>{
            if (!el.data_anull) return false;

            const dataAnull = dayjs(el.data_anull);
            const startDay = dayjs(dateS);
            const endDay = dayjs(dateP);
            
            return dataAnull.isSame(startDay, 'day') || dataAnull.isSame(endDay, 'day') ||
            (dataAnull.isAfter(startDay) && dataAnull.isBefore(endDay))
        })
        return anullContr
    }


    // Функция для получения имени и УНП компании по ID
    function getCompanyNameAndUNP(id) {
        const company = Company.find(c => c._id === id);
        return company ? { name: company.name, unp: company.unp } : { name: '', unp: '' };
    }

    // функция генерация отчета по субьектам
    function handleGetReadyReport() {
        const newContractToRenew = handleGetReportToRenew(dateS, dateP);
        const newContractToAdd = handleGetReportToAdd(dateS, dateP);
        const newContractAnull = handleGetAnullContr(dateS, dateP);

        const newProdlenie = newContractToRenew.filter(obj1 => 
            !newContractToAdd.some(obj2 => obj1._id === obj2._id)
        );
        // Создание рабочей книги
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Сертификаты');

        // Добавление заголовков
        worksheet.columns = [
            { header: 'Группа', key: 'group', }, // Добавляем столбец для названия группы
            { header: 'Номер сертификата', key: 'certif',  },
            { header: 'Наименование организации', key: 'name',  flex:1},
            { header: 'УНП', key: 'unp',  },
            { header: 'ФИО представителя', key: 'representative',  },
            { header: 'Срок сертификата', key: 'data_cert', },
            { header: 'Срок контракта', key: 'data_contr', },
            { header: 'Срок доверенности', key: 'data_dover',  }
          ];

        // Функция для создания строки данных
        function createRow(obj) {
            const comData = getCompanyNameAndUNP(obj._com._id);
            const year2999 = '2999';

            // Проверка года на 2999 и установка бессрочного или даты
            const dataContrYear = dayjs(obj.data_contr).year().toString();
            const dataDoverYear = dayjs(obj.data_dover).year().toString();

            const dataContr = dataContrYear === year2999 ? 'Бессрочный' : dayjs(obj.data_contr).format('DD.MM.YYYY') || '';
            const dataDover = dataDoverYear === year2999 ? 'Бессрочный' : dayjs(obj.data_dover).format('DD.MM.YYYY') || '';
            return {
                certif: obj.certif || '',
                name: comData.name || '',
                unp: comData.unp.toString() || '',
                representative: obj._subj.name || '',
                data_cert: dayjs(obj.data_cert).format('DD.MM.YYYY') || '',
                data_contr: dataContr,
                data_dover: dataDover
            };
        }
        const groupColors = {
            'На добавление': { argb: 'FF92D050' }, // Зеленый
            'Продление': { argb: 'FFFFC000' }, // Оранжевый
            'Аннулирование': { argb: 'FFba6363' } // Красный
          };
        // Добавление данных
        let currentGroup = ''; // Текущая группа для проверки смены группы
        [["На добавление", newContractToAdd], ["Продление", newProdlenie], ["Аннулирование", newContractAnull]].forEach(([title, data]) => {
            if (data.length === 0) {
                const emptyGroupRow = worksheet.addRow({ group: title }); // Добавляем строку с названием группы
                emptyGroupRow.eachCell(cell => {
                  cell.font = { bold: true, size: 16 }; // Жирный шрифт размером 16
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: groupColors[title] }; // Цвет фона
                });
                worksheet.addRow([]); // Добавляем пустую строку
                return;
            }
            data.forEach((item, index) => {
                // Если новая группа, добавляем строку с названием группы
                if (currentGroup !== title) {
                const groupRow = worksheet.addRow({ group: title }); // Добавляем строку с названием группы
                groupRow.eachCell(cell => {
                    cell.font = { bold: true, size: 16 }; // Жирный шрифт размером 16
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: groupColors[title] }; // Цвет фона
                });
                currentGroup = title; // Обновляем текущую группу
                }

                // Добавляем данные строки
                const row = worksheet.addRow(createRow(item, title));
                row.getCell(1).value = title; // Устанавливаем название группы в первый столбец
                row.eachCell(cell => {
                    cell.font = { size: 16 }; // Размер шрифта 16 для всех ячеек
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: groupColors[title] }; // Цвет фона для всей группы
                });
            });

            // Добавляем пустую строку между группами
            worksheet.addRow([]);
        });
        const headerRow = worksheet.getRow(1); // Первая строка — заголовки
        headerRow.eachCell(cell => {
          cell.font = { bold: true, size: 16 }; // Жирный шрифт размером 16 для заголовков
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C0C0C0' } }; // Серый фон для заголовков
        });
        // Автоматическая настройка ширины столбцов
        worksheet.columns.forEach(column => {
        let maxLength = column.header.toString().length; // Длина заголовка
        column.eachCell({ includeEmpty: true }, (cell) => {
            if (cell.value && typeof cell.value === 'string') {
                maxLength = Math.max(maxLength, cell.value.toString().length);
            }
        });
            column.width = maxLength * 1.6; // Добавляем отступы
        });

        // Экспорт в файл через Blob для браузера
        workbook.xlsx.writeBuffer().then(data => {
            const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);

            // Создаем ссылку для скачивания
            const a = document.createElement('a');
            a.href = url;
            a.download = `Reestr06${dayjs(new Date()).format('DDMMYYYY')}.xlsx`;
            document.body.appendChild(a);
            a.click();

            // Очищаем ссылку
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            enqueueSnackbar(`Файл создан успешно.`, { variant: `success` });
        }).catch(err => {
            enqueueSnackbar(`Ошибка при создании файла. ${err}`, { variant: `error` });

        });
        return [newContractToAdd, newProdlenie, newContractAnull]
    }

    

    return (
        <Dialog fullWidth open={open} onClose={() => onClose()}>
        <DialogTitle>Формирование отчета:</DialogTitle>
        <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding:1}}>

                <Box sx={{display:`flex`, gap:1}}>
                    <DatePicker 
                        sx={{width:'100%'}}
                        label="Дата С"
                        value={dateS} 
                        onChange={(newValue) => {setDateS(newValue)}} 
                    />  
                    <DatePicker 
                        sx={{width:'100%'}}
                        label="Дата ПО"
                        value={dateP} 
                        onChange={(newValue) => {setDateP(newValue)}} 
                    />                 
                </Box>
            </Box>
        </DialogContent>

        <DialogActions>
            <Button onClick={() => onClose()}>Отмена</Button>
            <Button
                title="Загрузить Excel файл"
                onClick={async () => { handleGetReadyReport() }}
            >
            Загрузить
            </Button>
        </DialogActions>

        </Dialog>
    );
}
