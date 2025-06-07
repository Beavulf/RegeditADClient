// используется для фокусировки на поле ввода и ввода текста в поле ввода при нажатии на клавишу ()
import { useEffect } from 'react';
// autocomplete еспользуется для пометки элемента автозаполнения - если используется элемент автозаполнения 
// то не блокируем стандартное поведение и наооборот
export function useSetFocusAndText(setSearchSubj, inputId, autocomplete = false) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.ctrlKey || event.altKey || event.metaKey ||
        event.key === 'Tab' || event.key === 'Escape' ||
        event.key === 'Enter' || event?.key?.length !== 1
      ) {
        return;
      }
      if (
        event.target.tagName === 'INPUT' ||
        event.target.tagName === 'TEXTAREA' ||
        event.target.isContentEditable
      ) {
        return;
      }
      const searchField = document.getElementById(inputId);
      if (searchField) {
        autocomplete ? null : event.preventDefault();
        searchField.focus();
        setSearchSubj(event.key);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [setSearchSubj, inputId, autocomplete]);
}