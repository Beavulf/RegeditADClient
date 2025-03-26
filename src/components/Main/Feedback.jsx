// src/components/FeedbackForm.js
import { useState, useEffect } from 'react';
import {
    Button, 
    Typography, 
    TextField, 
    Box, 
    Paper
} from '@mui/material'
import { useDialogs } from '@toolpad/core/useDialogs';
import { useUsers, useWebSocketContext } from '../../websocket/WebSocketContext.jsx'
const SERVER_ADDRESS = import.meta.env.VITE_SERVER_ADDRESS
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT

import dayjs from 'dayjs';
import 'dayjs/locale/ru';
dayjs.locale('ru');
const Feedback = () => {
    const { sendJsonMessage } = useWebSocketContext()
    const Users = useUsers()
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [feedbacks, setFeedbacks] = useState([]);
    const dialogs = useDialogs();
  
    //   получение фидбеков при подключении
    async function getFeedbacks() {
        try {
            const response = await fetch(`http://${SERVER_ADDRESS}:${SERVER_PORT}/feedbacks`);
            if (!response.ok) {
                throw new Error('Ошибка получения Фидбеков');
            }
            const data = await response.json();
            setFeedbacks(data); // Сохраняем данные в состоянии
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
        }
    }
  
    useEffect(() => {
        getFeedbacks();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', title);
        formData.append('descrip', description);
        formData.append('_who', Users.find(el=>el.address === localStorage.getItem(`clientIp`))._id,);

        if (image) {
            formData.append('image', image);
        }

        try {
        const response = await fetch(`http://${SERVER_ADDRESS}:${SERVER_PORT}/feedback`, {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            dialogs.alert('Feedback отправлен успешно!');
            getFeedbacks();
            setTitle('');
            setDescription('');
            setImage(null);
        } else {
            alert('Ошибка отправки feedback.');
        }
        } catch (error) {
        console.error('Error submitting feedback:', error);
        }
    };

    async function setStatus(id,status){
        const result = await window.prompt('Вписать статус', `${status}`,{
            okText: 'Сохранить',
            cancelText: 'Отмена',
          });
        if (result) {
            const message = {
                type: 'updateInCollection',
                data: {
                collection: 'Feedback',
                filter: { _id: id },
                value: { status: result },
                },
            }
            await sendJsonMessage(message)
            getFeedbacks();
        }        
    }
    

    async function handleDeleteFeedBack(id,who) {
        const author = Users.find(el=>el._id === who).address || null
        if (author === localStorage.getItem(`clientIp`) || localStorage.getItem('userRole') === 'admin') {
            const result = await dialogs.confirm('Вы уверены, что хотите удалить фидбек?')
            if (result) {
                try {
                    const response = await fetch(`http://${SERVER_ADDRESS}:${SERVER_PORT}/feedbackdel`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ id: id })
                    });
                
                    if (response.ok) {
                      getFeedbacks();
                    }
                  } catch (error) {
                    console.error('Ошибка удаления feedback:', error);
                  }
            }
        } else {
            dialogs.alert('Вы не можете удалить фидбек другого пользователя')
        }
    }
  return (
    <Box sx={{gap:'20px', display:'flex', flexDirection:'column'}}>
        <Box sx={{display:'flex', }}>
            <form style={{display:'flex', gap:'20px',  justifyContent:'space-between', width:'100%',}} onSubmit={handleSubmit} encType="multipart/form-data">
                <Box sx={{display:'flex', gap:'20px', width:'100%', alignItems:'center'}}>
                    <Box sx={{display:'flex',flex:0.35}}>
                        <TextField
                            id="title"
                            label="Заголовок"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            fullWidth
                        />
                    </Box>

                    <Box sx={{display:'flex', flex:1}}>
                        <TextField
                            id="descrip"
                            label="Описание"
                            size='small'
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            fullWidth
                            multiline
                            rows={2}
                        />
                    </Box>

                    <Box sx={{display:'block', gap:2}}>
                        <Typography>Прикрепить изображение:</Typography>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files[0])}
                        />
                    </Box>
                </Box>

                <Button type="submit" variant='outlined' sx={{height:'60px'}}>ОТПРАВИТЬ</Button>

            </form>
        </Box>
        <hr style={{width:'100%', margin:0}}/>
        <Box>
            {/* <h2>Список фидбека</h2> */}
            {feedbacks && feedbacks.map(feedback =>{
                const color = feedback.status.split(',')[0]=== '1' ? '#1fe81c' : 
                            feedback.status.split(',')[0]=== '2' ? '#e81c29' :  
                            feedback.status.split(',')[0]=== '3' ? '#e8d41c' : ''
                return (
                    <Paper 
                        key={feedback._id} 
                        style={{
                            padding: '10px 10px 10px 15px', 
                            marginBottom: '10px', 
                            width: '100%', 
                            display: 'flex', 
                            gap: '20px',
                        }}
                    > 
                    <Box sx={{backgroundColor:color, width:'10px', height:'30px',m:0, p:0, right:'700px',clipPath: 'polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)'}}></Box>
                        <Box 
                            sx={{
                                transition: 'background-color 0.3s ease',
                                display: 'flex', 
                                flexDirection: 'column', 
                                flex: '1', 
                                alignItems:'flex-start',
                                overflow: 'hidden',
                                '&:hover': {
                                    backgroundColor: '#4541414d',
                                    transform: 'scale(1.01)'
                                }
                            }}
                            
                        >
                            {/* верхнее меню заголовк и автор */}
                            <Box sx={{display:'flex',marginBottom: '10px', justifyContent:'space-between', width:'100%'}}>
                                <Typography 
                                    color='lightBlue' 
                                    variant='h5' 
                                >
                                    {feedback.title}
                                </Typography>
                                <Typography sx={{display:'flex'}} color='gray' variant='body2'>
                                    Автор: {Users.find(el=>el._id === feedback._who).name || ''} {dayjs(feedback.data_dob).format('DD.MM.YYYY HH:mm')}
                                </Typography>
                            </Box>
                            {/* основной текст проблемы */}
                            <Box sx={{overflow: 'auto',maxHeight: '150px',wordWrap: 'break-word', display:'flex', marginBottom:'10px'}}>
                                <Typography 
                                    variant='body1' 
                                    sx={{ wordWrap: 'break-word',}}
                                >
                                    {feedback.descrip}
                                </Typography>
                            </Box>
                            {/* статус */}
                            <Box sx={{ marginTop: 'auto', display:'flex', justifyContent:'space-between', width:'100%', alignItems:'center'}}>
                                <Typography 
                                    onClick={() => {
                                        if (localStorage.getItem('userRole') === 'admin') {
                                            setStatus(feedback._id,feedback.status)
                                        }
                                    }}
                                    color='gray'
                                    variant='body2' 
                                    sx={{ wordWrap: 'break-word',cursor:'pointer'}}
                                >
                                   <u>Статус:</u> {feedback.status} 
                                </Typography>
                                <Button color='error' variant='text' onClick={()=>handleDeleteFeedBack(feedback._id, feedback._who)}>удалить</Button>
                            </Box>
                            
                        </Box>
                        {feedback.image && (
                            <img
                                src={`http://${SERVER_ADDRESS}:${SERVER_PORT}${feedback.image}`}
                                alt="FeedbackIMG"
                                style={{ maxWidth: '200px', maxHeight: '200px', cursor: 'pointer' }}
                                onClick={() => window.open(`http://${SERVER_ADDRESS}:${SERVER_PORT}${feedback.image}`, '_blank')}
                            />
                        ) ||
                            <Box sx={{maxHeight:'200px', maxWidth:'200px', display:'flex', justifyContent:'center', alignItems:'center',}}>
                                <Typography sx={{wordWrap: 'break-word'}}>
                                    ТУТ МОГЛА БЫТЬ ВАША РЕКЛАМА
                                </Typography> 
                            </Box>
                        }
                    </Paper>
                )
            })}
        </Box>
    </Box>
  );
};

export default Feedback;