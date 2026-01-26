export default function groupRows({row, rows}) {
    try {
        const filterDataDob = row?.data_dob || ''; 
        const filterWhoId = row?._who?._id || '';
        const filterOtdel = row?._pto?._id || ''; 

        const filteredItems = rows.filter(item => {
            const matchesDate = item.data_dob === filterDataDob || !filterDataDob; // Если фильтр пустой, то пропускаем фильтрацию по дате
            const matchesWhoId = item._who._id === filterWhoId || !filterWhoId;    // Если фильтр пустой, то пропускаем фильтрацию по _who._id
            const matchesOtdel = item?._pto?._id === filterOtdel || !filterOtdel;
            return matchesDate && matchesWhoId && matchesOtdel;
        });  
        return filteredItems;
    } catch (error) {
        console.error('Ошибка при группировки строк во время удаления:', error);
        return [];
    }
}