export default function groupRows({row, rows}) {
    try {
        const filterDataDob = row?.data_dob || ''; 
        const filterWhoId = row?._who?._id || '';    
        const filteredItems = rows.filter(item => {
            const matchesDate = item.data_dob === filterDataDob || !filterDataDob; // Если фильтр пустой, то пропускаем фильтрацию по дате
            const matchesWhoId = item._who._id === filterWhoId || !filterWhoId;    // Если фильтр пустой, то пропускаем фильтрацию по _who._id
            return matchesDate && matchesWhoId;
        });  
        return filteredItems;
    } catch (error) {
        console.error('Ошибкапри группировки строк во время удаления:', error);
        return [];
    }
}