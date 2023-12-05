import { Length } from "class-validator";
import { LoginDto } from "./LoginDto";
export class SignupDto extends LoginDto {
    @Length(10, 13)
    phone: string;

    first_name: string;
    last_name: string;
    profile_pic: string;
}