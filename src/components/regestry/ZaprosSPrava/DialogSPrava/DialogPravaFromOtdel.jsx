import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  Stack,
  TextField,
  Typography,
  IconButton, 
  Tooltip,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy'; // импорт иконки копирования

import dayjs from 'dayjs';
import 'dayjs/locale/ru';
dayjs.locale('ru');

const statusMeta = {
  0: { icon: '❌', label: 'Не выдано', color: 'default' },
  1: { icon: '✅', label: 'Выдано', color: 'success' },
  2: { icon: '⚠️', label: 'Спец', color: 'warning' },
};

function normalizeText(value) {
  return String(value ?? '').trim().toLowerCase();
}

function formatDate(value) {
  const d = dayjs(value);
  return d.isValid() ? d.format('DD.MM.YYYY') : '—';
}

function getRowFio(row) {
  return row?._sotr?.fio || row?.fio || '—';
}

function PravaChips({ prava }) {
  const issued = useMemo(() => (prava || []).filter((p) => p?.status === 1 || p?.status === 2), [prava]);

  if (!issued.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        Выданных прав нет
      </Typography>
    );
  }

  return (
    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
      {issued.map((p) => {
        const meta = statusMeta[p.status] ?? statusMeta[0];
        const label = `#${p.id}${p.status === 2 ? '-S' : ''}`;
        return (
          <Chip
            key={p.id}
            size="small"
            variant="outlined"
            color={meta.color}
            label={`${meta.icon} ${label}${p.note ? ` — ${p.note}` : ''}`}
            sx={{ maxWidth: '100%' }}
            onClick={()=>{}}
          />
        );
      })}
    </Stack>
  );
}

export default function DialogPravaFromOtdel({
  open,
  onClose,
  otdelName,
  people = [],
}) {
  const [query, setQuery] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const filtered = useMemo(() => {
    const q = normalizeText(query);
    if (!q) return people;

    return people.filter((row) => {
      const fio = normalizeText(getRowFio(row));
      const prikaz = normalizeText(row?.prikaz);
      const pravaStr = normalizeText(
        (row?.prava || [])
          .filter((p) => p?.status === 1 || p?.status === 2)
          .map((p) => `#${p.id}${p.status === 2 ? '-s' : ''} ${p.note || ''}`)
          .join(' ')
      );
      return fio.includes(q) || prikaz.includes(q) || pravaStr.includes(q);
    });
  }, [people, query]);

  const title = otdelName ? `Права отдела ${otdelName}` : 'Права отдела';

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={() => onClose?.()} >
      <DialogTitle>{title}</DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              fullWidth
              size="small"
              label="Поиск по ФИО / приказу / правам"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
              Найдено: {filtered.length}
            </Typography>
          </Box>

          <Divider />

          {!otdelName ? (
            <Typography color="text.secondary">
              Выберите отдел, чтобы показать список.
            </Typography>
          ) : filtered.length ? (
            <List dense disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {filtered.map((row, idx) => {
                // Формируем строку для копирования в буфер обмена
                const pravaListStr = (row?.prava || [])
                  .filter((p) => p?.status === 1 || p?.status === 2)
                  .map(
                    (p) =>
                      `${p.id}${p.status === 2 ? '-s' : ''}${p.note ? ` (${p.note})` : ''}`
                  )
                  .join(', ') || '—';

                //копирование прав в буфер обмена
                const handleCopy = async () => {
                  try {
                    await navigator.clipboard.writeText(pravaListStr);
                    enqueueSnackbar('Права скопированы в буфер обмена', { variant: 'success' });
                  } catch (e) {
                    console.log('Ошибка при копировании в буфер обмена:', e);
                    alert('Ошибка при копировании в буфер обмена.');                    
                  }
                };

                return (
                  <ListItem
                    key={row?._id || `${row?._sotr?._id || 'row'}-${row?.prikaz || ''}-${idx}`}
                    disableGutters
                    sx={{
                      p: 1.25,
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {getRowFio(row)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Приказ: {row?.prikaz || '—'} • Дата: {formatDate(row?.data_prikaza)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PravaChips prava={row?.prava} />
                        <Tooltip title="Скопировать список прав" arrow placement='top' followCursor>
                            <IconButton size="small" onClick={handleCopy}><ContentCopyIcon /></IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </ListItem>
                );
              })}
            </List>
          ) : (
            <Typography color="text.secondary">Данных нет.</Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => onClose?.()}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
}

DialogPravaFromOtdel.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  otdelName: PropTypes.string,
  people: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      prikaz: PropTypes.string,
      data_prikaza: PropTypes.any,
      _sotr: PropTypes.shape({
        _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        fio: PropTypes.string,
      }),
      fio: PropTypes.string,
      prava: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number,
          status: PropTypes.number,
          note: PropTypes.string,
        })
      ),
    })
  ),
};

PravaChips.propTypes = {
  prava: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      status: PropTypes.number,
      note: PropTypes.string,
    })
  ),
};
