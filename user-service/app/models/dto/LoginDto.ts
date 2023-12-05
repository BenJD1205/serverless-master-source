import { IsEmail, Length } from "class-validator";

export class LoginDto {
    @IsEmail()
    email: string;

    @Length(6, 32)
    password: string;
}