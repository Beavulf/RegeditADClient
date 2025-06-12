import {Fade, Typography, Box, Button, Paper} from '@mui/material'
import {memo} from 'react'

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

const SubjectListMenu = ({ selectSubject, getSubjectContracts, filteredSubjects=[], searchSubj }) => {

    const subjectListElement = (sbj) => {
        return (
            <Fade 
                key={sbj._id} 
                in={true} 
                timeout={300} 
                style={{ transitionDelay: `300ms` }}
            >
            <Box key={sbj._id} sx={{display:`flex`, flexDirection:`column`}}>
                <Button  
                variant={selectSubject && sbj._id === selectSubject._id ? `contained` : `outlined`} 
                sx={{display:`flex`, flexDirection:`column`, fontSize:`11px`}} 
                onClick={()=>getSubjectContracts(sbj)}>
                    {sbj.name}
                    <Box color={`GrayText`} sx={{display:`flex`, justifyContent:`space-between`, padding:`0 3px`}}>
                        <Typography variant='caption'>{dayjs(new Date(sbj.data_dob)).format(`DD.MM.YYYY`)}-</Typography>
                        <Typography variant='caption'>{sbj._who.name}</Typography>
                    </Box>
                </Button>                          
            </Box>
            </Fade>
        )
    }

    return (
        <Paper variant='elevation' elevation={1} 
            sx={{
                width:`270px`, 
                display:`flex`, 
                flexDirection:`column`, 
                padding:`4px`, gap:1, 
                maxHeight:`700px`,
                overflowY:`auto`,
            }}>
            {/* рендер кнопок */}
            {filteredSubjects.map(sbj=> subjectListElement(sbj) )}
            {/* отображение фразы если список пуст */}
            {searchSubj.length < 1 ? 
                <Typography 
                    color='gray' 
                    sx={{justifyContent:'center', margin:'auto 0', textShadow: '10px 10px 10px rgb(10, 9, 9)'}}>
                    Просто начните вводить ФИО <br /> для поиска...
                </Typography> 
            : undefined}
        </Paper>
    )
}

export default memo(SubjectListMenu)