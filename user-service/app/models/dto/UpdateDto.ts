import { Length } from "class-validator";

export class VerificationDto {
    @Length(6)
    code: string
}