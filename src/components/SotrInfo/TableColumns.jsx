import { useMemo } from 'react';

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

export const colNaznachenie = [
    { field: 'prikaz', headerName: 'Приказ',flex:0.3},
    { field: 'data_prikaza', headerName: 'Дата приказа',flex:0.3,
        type: 'date',
        valueGetter: (params) => {
            const date = dayjs(params);
            return date.isValid() ? date.toDate() : null;
            },
            renderCell: (params) => {
            if (params.value) {
                return dayjs(params.value).format('DD.MM.YYYY');
            }
            return null;
            },
    },
    { field: 'data_nazn', headerName: 'Дата назнач.',flex:0.3,
        type: 'date',
        valueGetter: (params) => {
            const date = dayjs(params);
            return date.isValid() ? date.toDate() : null;
            },
            renderCell: (params) => {
            if (params.value) {
                return dayjs(params.value).format('DD.MM.YYYY');
            }
            return null;
            },
    },
    { field: '_pred_znach', headerName: 'Пред.',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    }, 
    { field: '_new_znach', headerName: 'Новое',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    },
    { field: 'data_dob', headerName: 'Дата доб.',flex:0.3,
        type: 'date',
        valueGetter: (params) => {
            const date = dayjs(params);
            return date.isValid() ? date.toDate() : null;
            },
            renderCell: (params) => {
            if (params.value) {
                return dayjs(params.value).format('DD.MM.YYYY HH:mm');
            }
            return null;
            },
    }, 
    { field: '_who', headerName: 'Кто доб.',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    }, 
    { field: 'descrip', headerName: 'Описание', width: 150, flex:0.3, },
];

export const colPriem =
[
    { field: 'prikaz', headerName: 'Приказ',flex:0.3},
    { field: 'data_priema', headerName: 'Дата приема',flex:0.3,
        type: 'date',
        valueGetter: (params) => {
            const date = dayjs(params);
            return date.isValid() ? date.toDate() : null;
            },
            renderCell: (params) => {
            if (params.value) {
                return dayjs(params.value).format('DD.MM.YYYY');
            }
            return null;
            },
    },
    { field: 'data_prikaza', headerName: 'Дата приказа',flex:0.3,
        type: 'date',
        valueGetter: (params) => {
            const date = dayjs(params);
            return date.isValid() ? date.toDate() : null;
            },
            renderCell: (params) => {
            if (params.value) {
                return dayjs(params.value).format('DD.MM.YYYY');
            }
            return null;
            },
    },
    { field: 'data_dob', headerName: 'Дата доб.',flex:0.3,
        type: 'date',
        valueGetter: (params) => {
            const date = dayjs(params);
            return date.isValid() ? date.toDate() : null;
            },
            renderCell: (params) => {
            if (params.value) {
                return dayjs(params.value).format('DD.MM.YYYY HH:mm');
            }
            return null;
            },
    }, 
    { field: '_who', headerName: 'Кто доб.',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    }, 
    { field: 'descrip', headerName: 'Описание', width: 150, flex:0.3, },
]

export const colUvolnenie =
[
    { field: 'prikaz', headerName: 'Приказ',flex:0.3},
    { field: 'data_prikaza', headerName: 'Дата приказа',flex:0.3,
        type: 'date',
        valueGetter: (params) => {
            const date = dayjs(params);
            return date.isValid() ? date.toDate() : null;
            },
            renderCell: (params) => {
            if (params.value) {
                return dayjs(params.value).format('DD.MM.YYYY');
            }
            return null;
            },
    },
    { field: 'data_uvol', headerName: 'Дата увольнения',flex:0.4,
        type: 'date',
        valueGetter: (params) => {
            const date = dayjs(params);
            return date.isValid() ? date.toDate() : null;
            },
            renderCell: (params) => {
            if (params.value) {
                return dayjs(params.value).format('DD.MM.YYYY');
            }
            return null;
            },
    },
    { field: 'data_dob', headerName: 'Дата доб.',flex:0.4,
        type: 'date',
        valueGetter: (params) => {
            const date = dayjs(params);
            return date.isValid() ? date.toDate() : null;
            },
            renderCell: (params) => {
            if (params.value) {
                return dayjs(params.value).format('DD.MM.YYYY HH:mm');
            }
            return null;
            },
    },
    { field: '_who', headerName: 'Кто доб.',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    }, 
    { field: 'descrip', headerName: 'Описание', flex:0.3, },
]

export const colSbrosAD =
[
    { field: 'action', headerName: 'Приказ',flex:0.3},
    { field: 'data', headerName: 'Дата вып.',flex:0.2,
        type: 'date',
        valueGetter: (params) => {
            const date = dayjs(params);
            return date.isValid() ? date.toDate() : null;
            },
            renderCell: (params) => {
            if (params.value) {
                return dayjs(params.value).format('DD.MM.YYYY');
            }
            return null;
            },
    },
    { field: '_who_do', headerName: 'Кто вып.',  flex:0.2,
        valueGetter: (params) => params?.name || ''
    }, 
    { field: 'data_dob', headerName: 'Дата доб.',flex:0.25,
        type: 'date',
        valueGetter: (params) => {
            const date = dayjs(params);
            return date.isValid() ? date.toDate() : null;
            },
            renderCell: (params) => {
            if (params.value) {
                return dayjs(params.value).format('DD.MM.YYYY HH:mm');
            }
            return null;
            },
    }, 
    { field: '_who', headerName: 'Кто доб.',  flex:0.2,
        valueGetter: (params) => params?.name || ''
    }, 
    { field: 'descrip', headerName: 'Описание', width: 150, flex:0.12, },
]

export const colPerevod =
[
    { field: 'prikaz', headerName: 'Приказ',flex:0.3},
    { field: 'data_prikaza', headerName: 'Дата приказа',flex:0.3,
        type: 'date',
        valueGetter: (params) => {
            const date = dayjs(params);
            return date.isValid() ? date.toDate() : null;
            },
            renderCell: (params) => {
            if (params.value) {
                return dayjs(params.value).format('DD.MM.YYYY');
            }
            return null;
            },
    },
    { field: 'data_per', headerName: 'Дата перевода',flex:0.3,
        type: 'date',
        valueGetter: (params) => {
            const date = dayjs(params);
            return date.isValid() ? date.toDate() : null;
            },
            renderCell: (params) => {
            if (params.value) {
                return dayjs(params.value).format('DD.MM.YYYY');
            }
            return null;
            },
    },
    { field: '_otkyda', headerName: 'Откуда',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    }, 
    { field: '_kyda', headerName: 'Куда',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    },
    { field: 'data_dob', headerName: 'Дата доб.',flex:0.4,
        type: 'date',
        valueGetter: (params) => {
            const date = dayjs(params);
            return date.isValid() ? date.toDate() : null;
            },
            renderCell: (params) => {
            if (params.value) {
                return dayjs(params.value).format('DD.MM.YYYY HH:mm');
            }
            return null;
            },
    }, 
    { field: '_who', headerName: 'Кто доб.',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    }, 
    { field: 'descrip', headerName: 'Описание', width: 150, flex:0.3, },
]

export const colVPerevod =
[
    { field: 'prikaz', headerName: 'Приказ',flex:0.3},
    { field: 'data_prikaza', headerName: 'Дата приказа',flex:0.3,
        type: 'date',
        valueGetter: (params) => {
            const date = dayjs(params);
            return date.isValid() ? date.toDate() : null;
            },
            renderCell: (params) => {
            if (params.value) {
                return dayjs(params.value).format('DD.MM.YYYY');
            }
            return null;
            },
    },
    { field: 'data_n', headerName: 'Дата С',flex:0.3,
        type: 'date',
        valueGetter: (params) => {
            const date = dayjs(params);
            return date.isValid() ? date.toDate() : null;
            },
            renderCell: (params) => {
            if (params.value) {
                return dayjs(params.value).format('DD.MM.YYYY');
            }
            return null;
            },
    },
    { field: 'data_k', headerName: 'Дата ПО',flex:0.3,
        type: 'date',
        valueGetter: (params) => {
            const date = dayjs(params);
            return date.isValid() ? date.toDate() : null;
            },
            renderCell: (params) => {
            if (params.value) {
                return dayjs(params.value).format('DD.MM.YYYY');
            }
            return null;
            },
    },
    { field: '_otkyda', headerName: 'Откуда',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    }, 
    { field: '_kyda', headerName: 'Куда',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    },
    { field: 'type', headerName: 'Тип перев.', width: 150, flex:0.3, },
    { field: 'data_dob', headerName: 'Дата доб.',flex:0.3,
        type: 'date',
        valueGetter: (params) => {
            const date = dayjs(params);
            return date.isValid() ? date.toDate() : null;
            },
            renderCell: (params) => {
            if (params.value) {
                return dayjs(params.value).format('DD.MM.YYYY HH:mm');
            }
            return null;
            },
    }, 
    { field: '_who', headerName: 'Кто доб.',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    }, 
    { field: 'descrip', headerName: 'Описание', width: 150, flex:0.3, },
]

export const colFamilia =
[
    { field: 'prikaz', headerName: 'Приказ',flex:0.3},
    { field: 'data_prikaza', headerName: 'Дата приказа',flex:0.3,
        type: 'date',
        valueGetter: (params) => {
            const date = dayjs(params);
            return date.isValid() ? date.toDate() : null;
            },
            renderCell: (params) => {
            if (params.value) {
                return dayjs(params.value).format('DD.MM.YYYY');
            }
            return null;
            },
    },
    { field: 'pred_znach', headerName: 'Старая', flex:0.3, },
    { field: 'new_znach', headerName: 'Новая',flex:0.3,}, 
    { field: 'data_dob', headerName: 'Дата доб.',flex:0.4,
        type: 'date',
        valueGetter: (params) => {
            const date = dayjs(params);
            return date.isValid() ? date.toDate() : null;
            },
            renderCell: (params) => {
            if (params.value) {
                return dayjs(params.value).format('DD.MM.YYYY HH:mm');
            }
            return null;
            },
    },
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
    { field: 'data_dob', headerName: 'Дата доб.',flex:0.3,
        type: 'date',
        valueGetter: (params) => {
            const date = dayjs(params);
            return date.isValid() ? date.toDate() : null;
            },
            renderCell: (params) => {
            if (params.value) {
                return dayjs(params.value).format('DD.MM.YYYY HH:mm');
            }
            return null;
            },
    }, 
    { field: '_who', headerName: 'Кто доб.',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    }, 
    { field: 'descrip', headerName: 'Описание', width: 150, flex:0.3, },
]

export const colSvodka =
[
    { field: 'deistvie', headerName: 'Действие',flex:0.5},
    { field: 'obosnovanie', headerName: 'Обоснование',  flex:0.4,},
    { field: 'data_dob', headerName: 'Дата доб.',flex:0.3,
        type: 'date',
        valueGetter: (params) => {
            const date = dayjs(params);
            return date.isValid() ? date.toDate() : null;
            },
            renderCell: (params) => {
            if (params.value) {
                return dayjs(params.value).format('DD.MM.YYYY HH:mm');
            }
            return null;
            },
    }, 
    { field: '_who', headerName: 'Кто доб.',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    }, 
    { field: 'descrip', headerName: 'Описание', width: 150, flex:0.3, },
]

export const colRevizor =
[
    { field: 'deistvie', headerName: 'Действие',flex:0.5},
    { field: 'obosnovanie', headerName: 'Обоснование',  flex:0.4,},
    { field: 'data_dob', headerName: 'Дата доб.',flex:0.3,
        type: 'date',
        valueGetter: (params) => {
            const date = dayjs(params);
            return date.isValid() ? date.toDate() : null;
            },
            renderCell: (params) => {
            if (params.value) {
                return dayjs(params.value).format('DD.MM.YYYY HH:mm');
            }
            return null;
            },
    }, 
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
    { field: 'data_dob', headerName: 'Дата доб.',flex:0.3,
        type: 'date',
        valueGetter: (params) => {
            const date = dayjs(params);
            return date.isValid() ? date.toDate() : null;
            },
            renderCell: (params) => {
            if (params.value) {
                return dayjs(params.value).format('DD.MM.YYYY HH:mm');
            }
            return null;
            },
    }, 
    { field: '_who', headerName: 'Кто доб.',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    }, 
    { field: 'descrip', headerName: 'Описание', width: 150, flex:0.3, },
]

export const colAipsin =
[
    { field: 'deistvie', headerName: 'Действие',flex:0.4},
    { field: 'obosnovanie', headerName: 'Обоснование',  flex:0.4,},
    { field: 'data_dob', headerName: 'Дата доб.',flex:0.3,
        type: 'date',
        valueGetter: (params) => {
            const date = dayjs(params);
            return date.isValid() ? date.toDate() : null;
            },
            renderCell: (params) => {
            if (params.value) {
                return dayjs(params.value).format('DD.MM.YYYY HH:mm');
            }
            return null;
            },
    }, 
    { field: '_who', headerName: 'Кто доб.',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    }, 
    { field: 'descrip', headerName: 'Описание', width: 150, flex:0.3, },
]

export const colStajirovka =
[
    { field: 'prikaz', headerName: 'Приказ',flex:0.3},
    { field: 'data_prikaza', headerName: 'Дата приказа',flex:0.3,
        type: 'date',
        valueGetter: (params) => {
            const date = dayjs(params);
            return date.isValid() ? date.toDate() : null;
            },
            renderCell: (params) => {
            if (params.value) {
                return dayjs(params.value).format('DD.MM.YYYY');
            }
            return null;
            },
    },
    { field: 'data_n', headerName: 'Дата начала',flex:0.3,
        type: 'date',
        valueGetter: (params) => {
            const date = dayjs(params);
            return date.isValid() ? date.toDate() : null;
            },
            renderCell: (params) => {
            if (params.value) {
                return dayjs(params.value).format('DD.MM.YYYY');
            }
            return null;
            },
    },
    { field: 'data_k', headerName: 'Дата окончания',flex:0.3,
        type: 'date',
        valueGetter: (params) => {
            const date = dayjs(params);
            return date.isValid() ? date.toDate() : null;
            },
            renderCell: (params) => {
            if (params.value) {
                return dayjs(params.value).format('DD.MM.YYYY');
            }
            return null;
            },
    },
    { field: '_otkyda', headerName: 'Откуда',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    }, 
    { field: '_kyda', headerName: 'Куда',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    },
    { field: 'data_dob', headerName: 'Дата доб.',flex:0.4,
        type: 'date',
        valueGetter: (params) => {
            const date = dayjs(params);
            return date.isValid() ? date.toDate() : null;
            },
            renderCell: (params) => {
            if (params.value) {
                return dayjs(params.value).format('DD.MM.YYYY HH:mm');
            }
            return null;
            },
    }, 
    { field: '_who', headerName: 'Кто доб.',  flex:0.3,
        valueGetter: (params) => params?.name || ''
    }, 
    { field: 'descrip', headerName: 'Описание', width: 150, flex:0.3, },
]

export const colADTool = 
[
    { field: 'id_userA', headerName: 'ID',  flex:0.1, }, 
    { field: 'date_s', headerName: 'Дата нач.',flex:0.3,
        type: 'date',
        valueGetter: (params) => {
            const date = dayjs(params);
            return date.isValid() ? date.toDate() : null;
            },
            renderCell: (params) => {
            if (params.value) {
                return dayjs(params.value).format('DD.MM.YYYY');
            }
            return null;
            },
    },
    { field: 'date_p', headerName: 'Дата конц.',flex:0.3,
        type: 'date',
        valueGetter: (params) => {
            const date = dayjs(params);
            return date.isValid() ? date.toDate() : null;
            },
            renderCell: (params) => {
            if (params.value) {
                return dayjs(params.value).format('DD.MM.YYYY');
            }
            return null;
            },
    },
    { field: 'prikaz', headerName: 'Приказ',  flex:0.3, }, 
    { field: 'who', headerName: 'Кто',  flex:0.3, }, 
    { field: 'date_z', headerName: 'Дата доб.',flex:0.3,
        type: 'date',
        valueGetter: (params) => {
            const date = dayjs(params);
            return date.isValid() ? date.toDate() : null;
            },
            renderCell: (params) => {
            if (params.value) {
                return dayjs(params.value).format('DD.MM.YYYY');
            }
            return null;
            },
    },
    { field: 'descriptions', headerName: 'Тип',  flex:0.3, }, 
]

export const colPdoka =
[
    { field: 'type', headerName: 'Действие', flex:0.3 },
    { field: 'lnp', headerName: 'ЛНП', flex:0.2,},
    { field: 'obosnovanie', headerName: 'Обоснование', width: 150, flex:0.3, },
    { field: 'data_prikaza', headerName: 'Д.Приказа', width: 150, flex:0.25, 
        type: 'date',
        valueGetter: (params) => {
                const date = dayjs(params);
                return date.isValid() ? date.toDate() : null;
            },
            renderCell: (params) => {
                if (params.value) {
                    return dayjs(params.value).format('DD.MM.YYYY');
                }
                return null;
            },
    },
    { field: 'data_dob', headerName: 'Добавлено', width: 150, flex:0.3,
        type: 'date',
        valueGetter: (params) => {
            const date = dayjs(params);
            return date.isValid() ? date.toDate() : null;
        },
        renderCell: (params) => {
            return dayjs(params.value).format('DD.MM.YYYY HH:mm');
        } 
    },
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