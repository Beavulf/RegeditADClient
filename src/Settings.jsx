// получение настроек приложения или их установка по умолчанию
export default function getSettings () {
    const storedSettings = localStorage.getItem('settings');
  
    if (storedSettings) {
      try {
          // Пытаемся распарсить JSON. Если ошибка, значит в localStorage невалидные данные.
        return JSON.parse(storedSettings);
      } catch (e) {
          console.error("Invalid settings in localStorage, resetting to defaults", e)
          localStorage.removeItem('settings')
      }
    }
  
    // Настройки по умолчанию
    const defaultSettings = {
      theme: 'light',
      notificationsEnabled: true,
      btnStyle:'elevation',
      // настройка кнопок главного меню
      fastTravelBtn: [
        {id:1,path:`/prava/pdoka`,name:`Дока и НАСТД`, bgColor:`#9c92921d`},
        {id:2,path:`/sotrudniki`,name:`Сотрудники`, bgColor:`#9c92921d`},
        {id:3,path:`/admin-edit-table/otdel`,name:`Отделы и Должности`, bgColor:`#9c92921d`},
        {id:4,path:`/admin-edit-table/users`,name:`Пользователи`, bgColor:`#9c92921d`}
      ],
      pageSizeDokaNASTD : 10,
    };
  
    localStorage.setItem('settings', JSON.stringify(defaultSettings));
    return defaultSettings;
  };