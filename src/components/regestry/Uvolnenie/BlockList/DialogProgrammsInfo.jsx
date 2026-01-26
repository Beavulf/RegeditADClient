import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Box, Typography, Chip } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';

export default function DialogProgrammsInfo({ payload, open, onClose }) {
  if (!payload) return null;

  const programs = [
    { name: 'Аипсин', value: payload.Aipsin },
    { name: 'Дока', value: payload.Pdoka },
    { name: 'ЦХДТИ', value: payload.Chdti },
    { name: 'Ревизор', value: payload.Revizor },
    { name: 'Сводка', value: payload.Svodka },
    { name: 'Запрос', value: payload.Zapros },
    { name: 'Запрос ПС', value: payload.ZaprosSPrava }
  ];

  const activePrograms = programs.filter(p => p.value);
  const inactivePrograms = programs.filter(p => !p.value);

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={() => onClose()}>
      <DialogTitle>Информация о программах где упоминался сотрудник</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle2" sx={{color: 'gray', fontSize:'12px' }}>
          *это не 100% список программ сотрудника, а всего лишь список тех программ, в которых упоминалися сотрудник в RegeditAD*
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '20px 0' }}>
          {activePrograms.length > 0 && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', color: 'success.main' }}>
                Программы, где необходимо заблокировать сотрудника:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {activePrograms.map((program) => (
                  <Chip
                    key={program.name}
                    icon={<CheckCircle />}
                    label={program.name}
                    color="success"
                    variant="outlined"
                    onClick={()=>{}}
                  />
                ))}
              </Box>
            </Box>
          )}

          {inactivePrograms.length > 0 && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', color: 'text.secondary' }}>
                Программы, где сотрудник отсутствует:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {inactivePrograms.map((program) => (
                  <Chip
                    key={program.name}
                    icon={<Cancel />}
                    label={program.name}
                    color="default"
                    onClick={()=>{}}
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}

          {activePrograms.length === 0 && (
            <Typography color="text.secondary">
              Сотрудник не найден ни в одной из программ.
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
}
