import { UserType } from "../types/user.type";

export const checkUserData = (): void => {
    const userInfo: string | null = sessionStorage.getItem('user');
    const user: UserType = JSON.parse(userInfo || '{}');

    if (!user.name || !user.lastName || !user.email) {
        location.href = '#/';
    }
}