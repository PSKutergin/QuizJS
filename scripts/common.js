const checkUserData = () => {
    const user = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : {};

    if (!user.name || !user.lastName || !user.email) {
        location.href = 'index.html';
    }
}