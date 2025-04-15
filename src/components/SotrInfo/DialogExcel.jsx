// MyDialog.jsx
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box
} from '@mui/material';
import { useState, useMemo, useEffect } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const DialogExcel = ({ onClose, data, tableName, onExport, open }) => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [dateColumns, setDateColumns] = useState([]);
    const [dateColumn, setDateColumn] = useState('');
    
    // Получаем список столбцов с датами
    useEffect(() => {
        if (data && data.length > 0) {
            const cols = Object.keys(data[0]).filter(key =>
                key.startsWith('data_') || key.startsWith('date_')
            );
            setDateColumns(cols);
        }
    }, [data]);

    useEffect(() => {
        console.log('Дата-столбцы:', dateColumns);
    }, [dateColumns]);

    const handleExport = () => {
        // Проверяем, выбраны ли даты и столбец
        if (!startDate || !endDate) {
            alert('Пожалуйста, выберите даты и столбец для фильтрации.');
            return;
        }
        console.log(data);
        
        // Фильтруем данные
        const filteredData = data.filter(item => {
            const itemDate = dayjs(item[dateColumn]);
            return itemDate.isBetween(startDate, endDate, 'day', '[]');
        });

        // Вызываем функцию экспорта с отфильтрованными данными
        onExport(filteredData);
        onClose(); // Закрываем диалоговое окно
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Экспорт в Excel</DialogTitle>
            <DialogContent>
                <p>Выберите диапазон дат и столбец для фильтрации:</p>
                <Box sx={{display:'flex', gap:1}}>
                    <DatePicker
                        sx={{width:'100%'}}
                        label="Начало периода"
                        value={startDate}
                        onChange={setStartDate}
                        format="DD.MM.YYYY"
                    />
                    <DatePicker
                        sx={{width:'100%'}}
                        label="Конец периода"
                        value={endDate}
                        onChange={setEndDate}
                        format="DD.MM.YYYY"
                    />
                </Box>
                <FormControl fullWidth sx={{mt:1}}>
                    <InputLabel id="date-column-select-label">Столбец с датой</InputLabel>
                    <Select
                        labelId="date-column-select-label"
                        id="date-column-select"
                        value={dateColumn}
                        label="Столбец с датой"
                        onChange={(e) => setDateColumn(e.target.value)}
                    >
                        {dateColumns.map(column => (
                            <MenuItem key={column} value={column}>{column}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Отмена</Button>
                <Button onClick={handleExport}>Экспорт</Button>
            </DialogActions>
        </Dialog>
    );
};

export default DialogExcel;