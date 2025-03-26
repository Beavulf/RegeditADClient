self.addEventListener('message', ({ data }) => {
    if (data.type === 'UPDATE_DATA') {
        const { newData, filters } = data;

        // Фильтрация
        let processedData = newData.map(row => ({
            id: row._id,
            ...row,
        }));

        if (filters && Object.keys(filters).length > 0) {
            processedData = processedData.filter(row =>
                Object.entries(filters).every(([column, value]) => {
                    if (!value) return true;
                    if (column === '_subj') return row._subj && row._subj._id === value;
                    if (column === '_contr') return row._contr === value;
                    return typeof row[column] === 'string'
                        ? row[column].toLowerCase().includes(value.toLowerCase())
                        : row[column] === value;
                })
            );
        }

        self.postMessage({ type: 'DATA_PROCESSED', data: processedData });
    }
});
