import React from 'react';

export const getRowStyles = (theme) => ({
    // заблокированная строка другим сотрудником
    selected: {
        backgroundColor: theme.palette.mode === 'dark' 
            ? theme.palette.selectedRow.main 
            : theme.palette.selectedRow.main,
    },
    // строка с ДЗ по GW в ДокаНАСТД
    dzgw: {
        backgroundColor: theme.palette.mode === 'dark'
            ? theme.palette.dzgw.main
            : theme.palette.dzgw.main,
        color: 'white',
        '&:hover': {
            backgroundColor: theme.palette.dzgw.light,
        },
    },
    // строка с просроченным сертификатом
    certEnd: {
        backgroundColor: theme.palette.mode === 'dark'
            ? theme.palette.subjectCertEnd.main
            : theme.palette.subjectCertEnd.main,
        color: 'white',
        '&:hover': {
            backgroundColor: theme.palette.subjectCertEnd.light,
        },
    },
    // строка с ануллированным сертификатом
    anull: {
        backgroundColor: theme.palette.mode === 'dark'
            ? theme.palette.subjectAnull.main
            : theme.palette.subjectAnull.main,
        color: 'white',
        '&:hover': {
            backgroundColor: theme.palette.subjectAnull.light,
        },
    }
});

export default getRowStyles;