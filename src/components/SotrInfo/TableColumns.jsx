import { useMemo } from 'react';

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
import { dateColumn } from '../DataGrid/DataGridUtils/columnFactories.js';
dayjs.locale('ru');

export const colNaznachenie = [
    { field: 'prikaz', headerName: 'Приказ',flex:0.3},
    dateColumn('data_prikaza', 'Дата приказа', 0.3),
    dateColumn('data_nazn', 'Дата назнач.', 0.3),
    { field: '_pred_znach', headerName: 'Пред.',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    }, 
    { field: '_new_znach', headerName: 'Новое',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    },
    dateColumn('data_dob', 'Дата доб.', 0.3, 'DD.MM.YYYY HH:mm'), 
    { field: '_who', headerName: 'Кто доб.',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    }, 
    { field: 'descrip', headerName: 'Описание', width: 150, flex:0.3, },
];

export const colPriem =
[
    { field: 'prikaz', headerName: 'Приказ',flex:0.3},
    dateColumn('data_priema', 'Дата приема', 0.3),
    dateColumn('data_prikaza', 'Дата приказа', 0.3),
    dateColumn('data_dob', 'Дата доб.', 0.3, 'DD.MM.YYYY HH:mm'), 
    { field: '_who', headerName: 'Кто доб.',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    }, 
    { field: 'descrip', headerName: 'Описание', width: 150, flex:0.3, },
]

export const colUvolnenie =
[
    { field: 'prikaz', headerName: 'Приказ',flex:0.3},
    dateColumn('data_prikaza', 'Дата приказа', 0.3),
    dateColumn('data_uvol', 'Дата увольнения', 0.4),
    dateColumn('data_dob', 'Дата доб.', 0.4, 'DD.MM.YYYY HH:mm'),
    { field: '_who', headerName: 'Кто доб.',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    }, 
    { field: 'descrip', headerName: 'Описание', flex:0.3, },
]

export const colSbrosAD =
[
    { field: 'action', headerName: 'Приказ',flex:0.3},
    dateColumn('data', 'Дата вып.', 0.2),
    { field: '_who_do', headerName: 'Кто вып.',  flex:0.2,
        valueGetter: (params) => params?.name || ''
    }, 
    dateColumn('data_dob', 'Дата доб.', 0.25, 'DD.MM.YYYY HH:mm'), 
    { field: '_who', headerName: 'Кто доб.',  flex:0.2,
        valueGetter: (params) => params?.name || ''
    }, 
    { field: 'descrip', headerName: 'Описание', width: 150, flex:0.12, },
]

export const colPerevod =
[
    { field: 'prikaz', headerName: 'Приказ',flex:0.3},
    dateColumn('data_prikaza', 'Дата приказа', 0.3),
    dateColumn('data_per', 'Дата перевода', 0.3),
    { field: '_otkyda', headerName: 'Откуда',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    }, 
    { field: '_kyda', headerName: 'Куда',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    },
    dateColumn('data_dob', 'Дата доб.', 0.4, 'DD.MM.YYYY HH:mm'), 
    { field: '_who', headerName: 'Кто доб.',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    }, 
    { field: 'descrip', headerName: 'Описание', width: 150, flex:0.3, },
]

export const colVPerevod =
[
    { field: 'prikaz', headerName: 'Приказ',flex:0.3},
    dateColumn('data_prikaza', 'Дата приказа', 0.3),
    dateColumn('data_n', 'Дата С', 0.3),
    dateColumn('data_k', 'Дата ПО', 0.3),
    { field: '_otkyda', headerName: 'Откуда',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    }, 
    { field: '_kyda', headerName: 'Куда',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    },
    { field: 'type', headerName: 'Тип перев.', width: 150, flex:0.3, },
    dateColumn('data_dob', 'Дата доб.', 0.3, 'DD.MM.YYYY HH:mm'), 
    { field: '_who', headerName: 'Кто доб.',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    }, 
    { field: 'descrip', headerName: 'Описание', width: 150, flex:0.3, },
]

export const colFamilia =
[
    { field: 'prikaz', headerName: 'Приказ',flex:0.3},
    dateColumn('data_prikaza', 'Дата приказа', 0.3),
    { field: 'pred_znach', headerName: 'Старая', flex:0.3, },
    { field: 'new_znach', headerName: 'Новая',flex:0.3,}, 
    dateColumn('data_dob', 'Дата доб.', 0.4, 'DD.MM.YYYY HH:mm'),
    { field: '_who', headerName: 'Кто доб.',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    }, 
    { field: 'descrip', headerName: 'Описание', flex:0.3, },
]

export const colZapros =
[
    { field: 'deistvie', headerName: 'Действие',flex:0.5},
    { field: 'obosnovanie', headerName: 'Обоснование',  flex:0.4,},
    { field: 'prava', headerName: 'Права',  flex:0.3,},
    dateColumn('data_dob', 'Дата доб.', 0.3, 'DD.MM.YYYY HH:mm'), 
    { field: '_who', headerName: 'Кто доб.',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    }, 
    { field: 'descrip', headerName: 'Описание', width: 150, flex:0.3, },
]

export const colSvodka =
[
    { field: 'deistvie', headerName: 'Действие',flex:0.5},
    { field: 'obosnovanie', headerName: 'Обоснование',  flex:0.4,},
    dateColumn('data_dob', 'Дата доб.', 0.3, 'DD.MM.YYYY HH:mm'), 
    { field: '_who', headerName: 'Кто доб.',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    }, 
    { field: 'descrip', headerName: 'Описание', width: 150, flex:0.3, },
]

export const colRevizor =
[
    { field: 'deistvie', headerName: 'Действие',flex:0.5},
    { field: 'obosnovanie', headerName: 'Обоснование',  flex:0.4,},
    dateColumn('data_dob', 'Дата доб.', 0.3, 'DD.MM.YYYY HH:mm'), 
    { field: '_who', headerName: 'Кто доб.',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    }, 
    { field: 'descrip', headerName: 'Описание', width: 150, flex:0.3, },
]

export const colChdti =
[
    { field: 'deistvie', headerName: 'Действие',flex:0.5},
    { field: 'obosnovanie', headerName: 'Обоснование',  flex:0.4,},
    { field: 'prava', headerName: 'Права',  flex:0.3,},
    dateColumn('data_dob', 'Дата доб.', 0.3, 'DD.MM.YYYY HH:mm'), 
    { field: '_who', headerName: 'Кто доб.',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    }, 
    { field: 'descrip', headerName: 'Описание', width: 150, flex:0.3, },
]

export const colAipsin =
[
    { field: 'deistvie', headerName: 'Действие',flex:0.4},
    { field: 'obosnovanie', headerName: 'Обоснование',  flex:0.4,},
    dateColumn('data_dob', 'Дата доб.', 0.3, 'DD.MM.YYYY HH:mm'), 
    { field: '_who', headerName: 'Кто доб.',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    }, 
    { field: 'descrip', headerName: 'Описание', width: 150, flex:0.3, },
]

export const colStajirovka =
[
    { field: 'prikaz', headerName: 'Приказ',flex:0.3},
    dateColumn('data_prikaza', 'Дата приказа', 0.3),
    dateColumn('data_n', 'Дата начала', 0.3),
    dateColumn('data_k', 'Дата окончания', 0.3),
    { field: '_otkyda', headerName: 'Откуда',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    }, 
    { field: '_kyda', headerName: 'Куда',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    },
    dateColumn('data_dob', 'Дата доб.', 0.4, 'DD.MM.YYYY HH:mm'), 
    { field: '_who', headerName: 'Кто доб.',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    }, 
    { field: 'descrip', headerName: 'Описание', width: 150, flex:0.3, },
]

export const colADTool =
[
    { field: 'login', headerName: 'Логин',  flex:0.3, },
    dateColumn('date_s', 'Дата нач.', 0.3),
    dateColumn('date_p', 'Дата конц.', 0.3),
    { field: 'prikaz', headerName: 'Приказ',  flex:0.3, }, 
    { field: 'who', headerName: 'Кто',  flex:0.3, }, 
    dateColumn('date_z', 'Дата доб.', 0.3),
    { field: 'descriptions', headerName: 'Тип',  flex:0.3, }, 
]

export const colPdoka =
[
    { field: 'type', headerName: 'Действие', flex:0.3 },
    { field: 'lnp', headerName: 'ЛНП', flex:0.2,},
    { field: 'obosnovanie', headerName: 'Обоснование', width: 150, flex:0.3, },
    dateColumn('data_prikaza', 'Д.Приказа', 0.25),
    dateColumn('data_dob', 'Добавлено', 0.3, 'DD.MM.YYYY HH:mm'),
    { field: '_who', headerName: 'Кто доб.', width: 150, flex:0.2,
        valueGetter: (params) => params?.name || ''
    },
    { field: '_who_do', headerName: 'Кто вып.', width: 150, flex:0.2,
        valueGetter: (params) => params?.name || ''
    },
    { field: 'descrip', headerName: 'Описание', width: 150, flex:0.3, },
]

export const allColumns = {
    naznachenieCol: colNaznachenie,
    priemCol: colPriem,
    uvolnenieCol: colUvolnenie,
    sbrosADCol: colSbrosAD,
    perevodCol: colPerevod,
    vperevodCol: colVPerevod,
    familiaCol: colFamilia,
    zaprosCol: colZapros,
    svodkaCol: colSvodka,
    revizorCol: colRevizor,
    chdtiCol: colChdti,
    aipsinCol: colAipsin,
    stajirovkaCol: colStajirovka,
    adToolCol: colADTool,
    pdokaCol: colPdoka,
}
export default allColumns;