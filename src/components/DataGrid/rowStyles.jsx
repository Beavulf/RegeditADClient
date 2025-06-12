import React from 'react';

export const getRowStyles = (theme) => ({
    // заблокированная строка другим сотрудником
    selected: {
        backgroundColor: 'selectedRow.main',
    },
    // строка с ДЗ по GW в ДокаНАСТД
    dzgw: {
        backgroundColor: 'dzgw.main',
        color: 'white',
        '&:hover': {
            backgroundColor: 'dzgw.light',
        },
    },
    // строка с просроченным сертификатом
    certEnd: {
        backgroundColor: 'subjectCertEnd.main',
        color: 'white',
        '&:hover': {
            backgroundColor: 'subjectCertEnd.light',
        },
    },
    // строка с ануллированным сертификатом
    anull: {
        backgroundColor: 'subjectAnull.main',
        color: 'white',
        '&:hover': {
            backgroundColor: 'subjectAnull.light',
        },
    }
});

export default getRowStyles;