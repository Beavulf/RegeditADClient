import React, { useState, useEffect, useRef } from 'react';
import { HexColorPicker } from 'react-colorful';
import { IconButton, Box } from '@mui/material';
import ColorLensIcon from '@mui/icons-material/ColorLens';

const ColorPicker = ({ initialColor = '#9c92921d', onColorChange }) => {
  const [currentColor, setCurrentColor] = useState(initialColor);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 }); // Позиция компонента
  const pickerRef = useRef(null); // Ссылка на компонент выбора цвета
  const buttonRef = useRef(null); // Ссылка на кнопку открытия

  const handleColorChange = (newColor) => {
    setCurrentColor(newColor);
    if (onColorChange) {
      onColorChange(newColor);
    }
  };

  const handleClickOutside = (event) => {
    if (
      pickerRef.current &&
      !pickerRef.current.contains(event.target) &&
      buttonRef.current &&
      !buttonRef.current.contains(event.target)
    ) {
      setShowPicker(false);
    }
  };

  const determinePickerPosition = () => {
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();

      // Определяем позицию выбора цвета
      setPickerPosition({
        top: buttonRect.bottom + window.scrollY + 10, // Добавляем отступ сверху
        left: buttonRect.left + window.scrollX, // Используем левую позицию кнопки
      });
    }
  };

  useEffect(() => {
    if (showPicker) {
      determinePickerPosition();
    }
  }, [showPicker]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Кнопка для открытия выбора цвета */}
      <IconButton
        ref={buttonRef}
        onClick={() => setShowPicker(!showPicker)}
        style={{ backgroundColor: currentColor }}
        size='small'
      >
        <ColorLensIcon />
      </IconButton>

      {/* Компонент выбора цвета */}
      {showPicker && (
        <Box
          ref={pickerRef}
          sx={{
            position: 'fixed', // Делаем компонент фиксированным
            top: pickerPosition.top, // Устанавливаем вычисленное положение
            left: pickerPosition.left,
            zIndex: 1300, // Высокий z-index для отображения поверх всех окон
            mt: 1,
            p: 1,
            background: '#fff',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            borderRadius: '8px',
          }}
        >
          <HexColorPicker
            color={currentColor}
            onChange={handleColorChange}
          />
        </Box>
      )}
    </>
  );
};

export default ColorPicker;
