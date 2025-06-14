/**
 * Компонент CAutoCompleate - кастомный компонент автодополнения на основе Material-UI Autocomplete
 * 
 * Используется для создания полей с автодополнением и выбором значений из списка.
 * Особенности:
 * - Автоматически выбирает единственный вариант при вводе
 * - Поддерживает гибкую настройку отображения через optionLabel
 * - Мемоизирует данные для оптимизации производительности
 * 
 * @param {string} idComp - Уникальный идентификатор компонента
 * @param {string} label - Текст метки поля
 * @param {Array} memoizedData - Массив данных для автодополнения
 * @param {string} elementToSelect - ID выбранного элемента
 * @param {Function} onChangeElement - Функция обратного вызова при изменении значения
 * @param {number} flex - Коэффициент flex для настройки ширины (по умолчанию 1)
 * @param {string} optionLabel - Поле объекта для отображения в выпадающем списке (по умолчанию 'fio')
 * 
 * Пример использования:
 * <CAutoCompleate
 *   idComp="sotrudnik"
 *   label="Сотрудник"
 *   memoizedData={sotrudniki}
 *   elementToSelect={selectedId}
 *   onChangeElement={handleChange}
 *   optionLabel="name"
 * />
 */

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
    optionLabel='fio',
    getNewOptionLabel, 
    newSize='medium'
}) => {
    // если есть выбранный элемент, то он будет выбран и в списке
    const selectedElement = useMemo(() => 
        memoizedData.find(o => o._id === elementToSelect) || null,
        [memoizedData, elementToSelect]
    );
    
    // фильтруем варианты по введенному значению и выбираем единственный вариант который остался
    const onElementInputChange = useCallback((event, newValue) => {
        const filteredOptions = memoizedData.filter(option => 
            option[optionLabel].toLowerCase().includes(newValue.toLowerCase()) ||
            String(option?.lnp).includes(newValue) ||
            String(option?.unp).includes(newValue)
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
                getOptionLabel={(option) => getNewOptionLabel ? getNewOptionLabel(option) : option[optionLabel]}
                isOptionEqualToValue={(option, value) => option._id === value?._id}
                renderInput={(params) => (
                    <TextField
                    {...params}
                    label={label}
                    variant="outlined"
                    size={newSize}
                    />
                )}
            />
        </FormControl>
    )
}

export default memo(CAutoCompleate);