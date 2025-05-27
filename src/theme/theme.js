import { createTheme } from '@mui/material/styles';

const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { light: {
    palette: {
      primary: {
        main: 'rgba(126, 9, 73, 0.81)', // Легкий розовый
        light: '#FDE7EC', // Очень светлый розовый
        dark: '#E8B0BD', // Немного темнее
      },
      secondary: {
        main: '#FAC4C7', // Теплый розовый
        light: '#FFE3E4', // Почти белый с розовым оттенком
        dark: '#E3A4A8', // Темный розовый
      },
      listToBlock:{
        main:'#2423230c',
        gradient:'linear-gradient(145deg, rgba(233, 127, 185, 0.08) 0%, rgba(187, 132, 192, 0.2) 100%)',
      },
      listPravaOtdel: {
        main: '#fc88b944', // Сохраняем как в светлой теме, если не переопределяется
        light: '#fc88b944',
        dark: '#ad49734e',
      },
      pravaOtdel:{
        main:'#24232322',
        light: '#2423230c',
        dark:'#242323cb'
      },
      subjectAnull:{
        main:'#ff2424a4',
        light:'#ff242486',
      },
      subjectCertEnd:{
        main:'#ff8e24a4',
        light:'#ff8e2486',
      },
      selectedRow:{
        main:'#8a6b295d',
      },
      dzgw:{
        main:'#bf766b',
        light:'#bf766bc6',
      },
      background: {
        default: '#FFFFFF', // Фон с легким розовым оттенком
        paper: '#FFF9FA',
      },
      text: {
        primary: '#5A5A5A',
        secondary: '#7A7A7A',
      },
    },
  }, dark: {
    palette: {
      primary: {
        main: '#90caf9', // Голубой
        light: '#e3f2fd',
        dark: '#42a5f5',
        contrastText: '#000000',
      },
      secondary: {
        main: '#ce93d8', // Фиолетовый
        light: '#f3e5f5',
        dark: '#ab47bc',
        contrastText: '#000000',
      },
      listToBlock:{
        main:'#242323cb',
        gradient:'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      listPravaOtdel: {
        main: '#383030', // Сохраняем как в светлой теме, если не переопределяется
        light: '#383030',
        dark: '#2e2727',
      },
      subjectAnull:{
        main:'#fc1e1e8f',
        light:'#fa4646ba',
      },
      subjectCertEnd:{
        main:'#ff8e24a4',
        light:'#ffa047a4',
      },
      selectedRow:{
        main:'#8a6b295d',
      },
      dzgw:{
        main:'#4e2f2a5d',
        light:'#4e2f2aaf',
      },
      background: {
        default: '#121212', // Тёмный фон
        paper: '#121212', // Чуть светлее для карточек 1d1d1d
      },
      text: {
        primary: '#ffffff', // Белый текст
        secondary: 'rgba(255, 255, 255, 0.7)', // Полупрозрачный белый
        disabled: 'rgba(255, 255, 255, 0.5)',
      },
      divider: 'rgba(255, 255, 255, 0.12)', // Разделители
      action: {
        active: '#ffffff',
        hover: 'rgba(255, 255, 255, 0.08)',
        selected: 'rgba(255, 255, 255, 0.16)',
        disabled: 'rgba(255, 255, 255, 0.3)',
        disabledBackground: 'rgba(255, 255, 255, 0.12)',
      },
    },
  }, },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1900,
    },
  },
});

export default demoTheme; 