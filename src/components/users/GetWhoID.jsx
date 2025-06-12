const getWhoId = (payload={}, Users) => {
    if (!Users) {
        alert('Не найдены пользователи при попытке сохранить документ (Users).');
        return; 
    }

    if (payload?._who?._id) return payload._who._id;
    const user = Users.find(el => el.address === localStorage.getItem('clientIp'));
    return user?._id;
}

export default getWhoId;