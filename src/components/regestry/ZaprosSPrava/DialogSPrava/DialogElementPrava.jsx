// компонент списка прав (каждое право в отдельном блоке)
import { memo, useMemo } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';

const PravoItem = ({ p, index, onChangeStatus, onChangeNote }) => {
    const statuses = useMemo(() => [
        { value: 0, label: 'Не выдано' },
        { value: 1, label: 'Выдано' },
        { value: 2, label: 'Спец' },
    ], []);
    
    return (
        <Box sx={{ p:1, display: 'flex', gap: 1, alignItems:'center'}}>
            <Typography variant="subtitle2" sx={{width:'40px'}}>#{p.id}</Typography>
            <FormControl fullWidth>
                <InputLabel>Статус</InputLabel>
                <Select
                    sx={{bgcolor:p.status === 0 ? '#f582827e' : p.status === 1 ? '#7fe3907e' : '#e3cd7f7e'}}
                    size='small'
                    value={p.status}
                    label="Статус"
                    onChange={(e) => onChangeStatus(index,e.target.value)}
                >
                    {statuses.map((s) => (
                        <MenuItem key={s.value} value={s.value} sx={{bgcolor:s.label === 'Не выдано' ? '#f582827e' : s.label === 'Выдано' ? '#7fe3907e' : '#e3cd7f7e'}}>
                            {s.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <TextField
                size='small'
                label="Примечание"
                value={p.note}
                onChange={(e) => onChangeNote(index,e.target.value)}
            />
        </Box>
    )
};

export default memo(PravoItem);