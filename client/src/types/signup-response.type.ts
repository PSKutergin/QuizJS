import { UserType } from "./user.type"

export type SignupResponseType = {
    error: boolean,
    message: string,
    user?: UserType
}