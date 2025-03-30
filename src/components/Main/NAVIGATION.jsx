import DashboardIcon from '@mui/icons-material/Dashboard';
import TableViewIcon from '@mui/icons-material/TableView';
import GroupIcon from '@mui/icons-material/Group';
import ContactEmergencyIcon from '@mui/icons-material/ContactEmergency';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import TerminalIcon from '@mui/icons-material/Terminal';
import DvrIcon from '@mui/icons-material/Dvr';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import ListAltIcon from '@mui/icons-material/ListAlt';
import Groups2Icon from '@mui/icons-material/Groups2';
import KeyIcon from '@mui/icons-material/Key';
import Chip from '@mui/material/Chip';
import PermContactCalendarIcon from '@mui/icons-material/PermContactCalendar';

export const createNavigation = (AccessDB) => [ 
  {
    kind: 'header',
    title: 'Основное',
  },
  {
    segment: 'dashboard',
    title: 'Главная',
    icon: <DashboardIcon />,
  },
  {
    segment: 'sotrudniki',
    title: 'Сотрудники',
    icon: <Groups2Icon />,
  },
  {
    segment: 'subject',
    title: 'Субъекты',
    icon: <PermContactCalendarIcon />,
  },
  {
    segment: 'registry',
    title: 'Реестры',
    icon: <AppRegistrationIcon />,
    children: [
      {
        segment: 'priem', 
        title: 'Прием на работу',
        icon: <ListAltIcon />,
      },
      {
        segment: 'adtool', 
        title: 'Данные из ADTool',
        icon: <ListAltIcon />,
      },
      {
        segment: 'naznachenie', 
        title: 'Назначение',
        icon: <ListAltIcon />,
      },
      {
        segment: 'perevod', 
        title: 'Перевод',
        icon: <ListAltIcon />,
      },
      {
        segment: 'vperevod', 
        title: 'Временный перевод',
        icon: <ListAltIcon />,
      },
      // {
      //   segment: 'obychenie', 
      //   title: '-Обучение',
      //   icon: <ListAltIcon />,
      // },
      {
        segment: 'stajirovka', 
        title: 'Стажировка',
        icon: <ListAltIcon />,
      },
      // {
      //   segment: 'dekret', 
      //   title: '-Декрет',
      //   icon: <ListAltIcon />,
      // },
      {
        segment: 'familia', 
        title: 'Фамилия',
        icon: <ListAltIcon />,
      },
      {
        segment: 'uvolnenie', 
        title: 'Увольнение',
        icon: <ListAltIcon />,
      },
    ]
  },
  {
    segment: 'prava',
    title: 'Права и АД',
    icon: <PendingActionsIcon />,
    children: [
      {
        segment: 'pdoka', 
        title: 'Дока и НАСТД',
        icon: <ContentPasteIcon />,
      },
      {
        segment: 'sbrosad',
        title: 'Active directory',
        icon: <ContentPasteIcon />,
      },
    ]
  },
  {
    segment: 'programm',
    title: 'Программы',
    icon: <TerminalIcon />,
    children: [
      {
        segment: 'zapros',
        title: 'Запрос',
        icon: <DvrIcon />,
      },
      {
        segment: 'svodka',
        title: 'Сводка',
        icon: <DvrIcon />,
      },
      {
        segment: 'revizor',
        title: 'Ревизор',
        icon: <DvrIcon />,
      },
      {
        segment: 'chdti',
        title: 'ЦхдТИ',
        icon: <DvrIcon />,
      },
      {
        segment: 'aipsin',
        title: 'Аипсин',
        icon: <DvrIcon />,
      },
    ]
  },
  {
    kind: 'divider',
  },
  {
    kind: 'header',
    title: 'Admin panel',
  },
  {
    segment: 'admin-edit-table',
    title: 'Редактирование таблиц',
    action: AccessDB.length>0 ?<Chip label={AccessDB.length} color="primary" size="small" /> : null,
    roles: [`admin`],
    icon: <TableViewIcon />,
    children:[
      {
        segment: 'users',
        title: 'Пользователи',
        icon: <GroupIcon />,
        roles: [`admin`],
      },
      {
        segment: 'otdel',
        title: 'Отделы и должности',
        icon: <ContactEmergencyIcon />,
        roles: [`admin`],
      },
      {
        segment: 'access',
        title: 'Выдача доступов',
        icon: <KeyIcon />,
        roles: [`admin`],
        action: <Chip label={AccessDB.length} color="primary" size="small" />,
      },
    ]
  },
];