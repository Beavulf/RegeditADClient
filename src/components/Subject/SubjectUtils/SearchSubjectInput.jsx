import { useState, useEffect, useCallback, memo } from 'react';
import { TextField, Box, InputAdornment, IconButton, CircularProgress, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSetFocusAndText } from '../../hooks/SetFocusAndText.jsx';
import DialogSubjectEdit from '../DialogSubjectEdit.jsx';
import { useDialogs } from '@toolpad/core/useDialogs';

const SearchSubjectInput = (({ onDebouncedSearchChange, initialSearchValue, handleClearFilter }) => {
    const [searchSubj, setSearchSubj] = useState(initialSearchValue || '');
    const [isSearching, setIsSearching] = useState(false);

    const dialogs = useDialogs();

    useSetFocusAndText(setSearchSubj, 'isearchSubj');

    useEffect(() => {
        if (searchSubj.length >= 2) {
            setIsSearching(true);
        }
        const timer = setTimeout(() => {
            onDebouncedSearchChange(searchSubj); 
            setIsSearching(false);
        }, 500);
        return () => {
            clearTimeout(timer);
        };
    }, [searchSubj, onDebouncedSearchChange]);

    const handleSearchChange = useCallback((value) => {
        setSearchSubj(value);
    }, []);

    const handleClearInput = useCallback(() => {
        setSearchSubj('');
        handleClearFilter();
        onDebouncedSearchChange(''); // Also clear debounced value in parent
    }, [onDebouncedSearchChange, handleClearFilter]);

    return (
        <Box sx={{ width: `270px`, display: `flex`, alignItems: `center`, gap: 1 }}>
            <TextField
                id="isearchSubj"
                label="ФИО"
                size='small'
                value={searchSubj}
                onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                        handleClearInput();
                    }
                }}
                onChange={(event) => { handleSearchChange(event.target.value) }}
                slotProps={{
                    input: {
                        endAdornment: (
                            <InputAdornment position="end">
                                {isSearching ? (
                                    <CircularProgress size={20} />
                                ) : searchSubj ? (
                                    <IconButton onClick={() => handleClearInput()}>
                                        <CloseIcon />
                                    </IconButton>
                                ) : null}
                            </InputAdornment>
                        ),
                    },
                }}
            />
            <Button 
                variant='contained' 
                title='Редактировать список субъектов' 
                onClick={async ()=>await dialogs.open(DialogSubjectEdit)}
            >доб.</Button>
        </Box>
    );
});

export default memo(SearchSubjectInput);

//