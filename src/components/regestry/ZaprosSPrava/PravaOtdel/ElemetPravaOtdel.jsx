import { Box, Typography, IconButton, TextField } from '@mui/material';
import { memo } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

const ElementPravaOtdel = ({el,handleEditPravaOtdel,handleDeletePravaOtdel})=> {
    return (
      <Box 
        sx={{display:'flex', gap:1, flexDirection:'column', bgcolor:'listPravaOtdel.main', p:1, borderRadius:'8px', mb:1,
          '&:hover':{scale:1.03}, 
          transition:'scale 0.3s ease-in-out', cursor:'pointer'
        }}
      >
          <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:1}}>
            <Box sx={{display:'flex', flexDirection:'row', gap:1}}>
              <Typography textAlign='left'>
                {el._otdel.name}
              </Typography>
              <Typography variant='body' color='gray' sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {el.descrip} 
              </Typography>
            </Box>
            <Box sx={{display:'flex', flexDirection:'row'}}>
              <IconButton size='small' onClick={()=>handleEditPravaOtdel(el)}>
                <EditIcon/>
              </IconButton>
              <IconButton size='small' onClick={()=>handleDeletePravaOtdel(el._id)}>
                <DeleteForeverIcon/>
              </IconButton>
            </Box>
          </Box>
          <TextField 
            multiline
            sx={{bgcolor:'listPravaOtdel.dark', borderRadius:'8px', p:0.5}} 
            slotProps={{
              input:{sx:{fontSize:'15px'}}
            }}
            size='small' 
            variant='standard' 
            fullWidth 
            value={el.prava}
          />
          <Typography textAlign='left' color='gray' sx={{m:0,p:0, fontSize:'12px'}}>
            Послед. изм. {dayjs(el.data_edit).format('DD.MM.YYYY HH:mm')}
          </Typography>
      </Box>
    )
  }

export default memo(ElementPravaOtdel);