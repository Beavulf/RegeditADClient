import { useState, useMemo, memo } from 'react';
import { IconButton, Popover, List, ListItem, ListItemText } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
const statusLabels = {
    0: { icon: '❌', text: 'Не выдано' },
    1: { icon: '✅', text: 'Выдано' },
    2: { icon: '⚠️', text: 'Спец' },
};
// отображение списка прав в таблице списком по клику на иконке
export default memo(function PravaPopoverCell({ value }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        event.stopPropagation(); // важно — не выделять строку
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => setAnchorEl(null);

    const filteredPrava = useMemo(()=>{
        return value.filter(el=>el.status === 1 || el.status === 2).map(el=>`#${el.id}${el.status===2 ? '-S':''}`).join(', ')
    },[value])

    return (
        <>
        {filteredPrava}
        <IconButton size="small" onClick={handleClick}>
            <VisibilityIcon fontSize="small" />
        </IconButton>
            
        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
            <List dense sx={{ maxWidth: 250, p: 1 }}>
            {value?.map((p) => (
                <ListItem key={p.id} disablePadding>
                <ListItemText
                    primary={
                    `#${p.id}: ${statusLabels[p.status]?.icon || '—'} ${statusLabels[p.status]?.text || ''}`
                    }
                    secondary={p.note || null}
                />
                </ListItem>
            ))}
            </List>
        </Popover>
        </>
    );
})