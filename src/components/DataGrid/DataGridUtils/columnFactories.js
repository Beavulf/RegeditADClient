import dayjs from 'dayjs';
import 'dayjs/locale/ru';

// фабрика date-колонок для MDataGrid: единые valueGetter/renderCell вместо копипасты в каждой странице
// size: <=1 трактуется как flex, >1 — как width (px)
// format: 'DD.MM.YYYY' по умолчанию; передай 'DD.MM.YYYY HH:mm' для даты со временем
export const dateColumn = (field, headerName, size = 0.3, format = 'DD.MM.YYYY') => ({
    field,
    headerName,
    ...(size > 1 ? { width: size } : { flex: size }),
    type: 'date',
    valueGetter: (params) => {
        const date = dayjs(params);
        return date.isValid() ? date.toDate() : null;
    },
    renderCell: (params) => {
        if (params.value) {
            return dayjs(params.value).format(format);
        }
        return null;
    },
});
