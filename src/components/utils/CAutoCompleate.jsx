import { FormControl, Autocomplete, TextField } from '@mui/material';
import { useMemo, memo, useCallback } from 'react';

// кастомный автокомплит
const CAutoCompleate = ({
    idComp, 
    label, 
    memoizedData=[], 
    elementToSelect, 
    onChangeElement, 
    flex=1,
    optionLabel='fio'
}) => {
    // если есть выбранный элемент, то он будет выбран и в списке
    const selectedElement = useMemo(() => 
        memoizedData.find(o => o._id === elementToSelect) || null,
        [memoizedData, elementToSelect]
    );
    
    // фильтруем варианты по введенному значению и выбираем единственный вариант который остался
    const onElementInputChange = useCallback((event, newValue) => {
        const filteredOptions = memoizedData.filter(option => 
            option[optionLabel].toLowerCase().includes(newValue.toLowerCase())
        );
        if (filteredOptions.length === 1) {
            onChangeElement(filteredOptions[0]);
            event?.target?.blur();
        }
    }, [memoizedData, onChangeElement, optionLabel]);
    
    return (
        <FormControl sx={{flex:flex}}> 
            <Autocomplete
                id={idComp}
                value={selectedElement || null}
                onChange={(event, newValue) => {
                    onChangeElement(newValue ? newValue : '')
                }}
                onInputChange={(event, value) => {
                    // Фильтруем варианты по введенному значению
                    onElementInputChange(event, value);
                }}
                options={memoizedData}
                getOptionLabel={(option) => option[optionLabel]}
                isOptionEqualToValue={(option, value) => option._id === value?._id}
                renderInput={(params) => (
                    <TextField
                    {...params}
                    label={label}
                    variant="outlined"
                    size='medium'
                    />
                )}
            />
        </FormControl>
    )
}

export default memo(CAutoCompleate);