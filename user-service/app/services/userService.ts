import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { autoInjectable } from 'tsyringe';
import { plainToClass } from 'class-transformer';
import { SignupDto } from '../models/dto/SignupDto';
import { LoginDto } from '../models/dto/LoginDto';
import { VerificationDto } from '../models/dto/UpdateDto';
import { AppValidationError } from '../utility/error';
import { SuccessResponse, ErrorResponse } from '../utility/response';
import { GenSalt, GetHashedPassword, GetToken, ValidatePassword, VerifyToken } from '../utility/password';
import { UserRepository } from '../repository/userRepository';
import { GenerateAccessCode, SendVerificationCode } from '../utility/notification';
import { TimeDifference } from '../utility/dateHelper';

@autoInjectable()
export class UserService {
    repository: UserRepository;
    constructor(repository: UserRepository) {
        this.repository = repository;
    }

    async ResponseWithError(event: APIGatewayProxyEventV2) {
        return ErrorResponse(404, "requested method is not supported!");
    }

    async CreateUser(event: APIGatewayProxyEventV2) {
        try {
            const input = plainToClass(SignupDto, event.body);
            const error = await AppValidationError(input);
            if (error) return ErrorResponse(404, error);
            const salt = await GenSalt();
            const hashedPassword = await GetHashedPassword(input.password, salt);
            const data = await this.repository.createAccount({
                email: input.email,
                password: hashedPassword,
                phone: input.phone,
                userType: 'BUYER',
                salt: salt,
                first_name: input.first_name,
                last_name: input.last_name,
                profile_pic: input.profile_pic,
            })
            return SuccessResponse(data);
        }
        catch (err) {
            console.log(err);
            return ErrorResponse(500, err);
        }
    }

    async UserLogin(event: APIGatewayProxyEventV2) {
        try {
            const input = plainToClass(LoginDto, event.body);
            const error = await AppValidationError(input);
            if (error) return ErrorResponse(404, error);
            const data = await this.repository.findAccount(input.email)
            const verified = await ValidatePassword(input.password, data.password, data.salt);
            if (!verified) {
                throw new Error("Password doesn't match")
            }
            const token = GetToken(data);
            return SuccessResponse({ token });
        }
        catch (err) {
            console.log(err);
            return ErrorResponse(500, err);
        }
    }

    async GetVerificationToken(event: APIGatewayProxyEventV2) {
        const token = event.headers.authorization;
        const payload = await VerifyToken(token);
        if (!payload) return ErrorResponse(403, "authorization failed!")
        const { code, expiry } = GenerateAccessCode();
        await this.repository.updateVerificationCode(payload.user_id, code, expiry);

        await SendVerificationCode(code, payload.phone)
        return SuccessResponse({ message: 'Verification code is sent to your registered mobile number' })
    }

    async VerifyUser(event: APIGatewayProxyEventV2) {
        const token = event.headers.authorization;
        const payload = await VerifyToken(token);
        if (!payload) return ErrorResponse(403, "authorization failed!")
        const input = plainToClass(VerificationDto, event.body);
        const error = await AppValidationError(input);
        if (error) return ErrorResponse(404, error);
        const { verification_code, expiry } = await this.repository.findAccount(payload.email);
        //find the user account
        if (verification_code === parseInt(input.code)) {
            //check expiry
            const currentTime = new Date();
            const diff = TimeDifference(expiry, currentTime.toISOString(), 'm')
            //update on DB
            if (diff > 0) {
                console.log("verified successfully")
            } else {
                return ErrorResponse(403, "Verification code is expired");
            }
        }
        return SuccessResponse({ message: 'response from verify user' })
    }

    //User Profile
    async CreateProfile(event: APIGatewayProxyEventV2) {
        return SuccessResponse({ message: 'response from Create user profile' })
    }

    async GetProfile(event: APIGatewayProxyEventV2) {
        return SuccessResponse({ message: 'response from get user profile' })
    }

    async EditProfile(event: APIGatewayProxyEventV2) {
        return SuccessResponse({ message: 'response from edit user profile' })
    }

    //Cart section
    async CreateCart(event: APIGatewayProxyEventV2) {
        return SuccessResponse({ message: 'response from Create cart' })
    }

    async GetCart(event: APIGatewayProxyEventV2) {
        return SuccessResponse({ message: 'response from get cart' })
    }

    async EditCart(event: APIGatewayProxyEventV2) {
        return SuccessResponse({ message: 'response from edit cart' })
    }

    //Payment section
    async CreatePaymentMethod(event: APIGatewayProxyEventV2) {
        return SuccessResponse({ message: 'response from Create payment method' })
    }

    async GetPaymentMethod(event: APIGatewayProxyEventV2) {
        return SuccessResponse({ message: 'response from get payment method' })
    }

    async EditPaymentMethod(event: APIGatewayProxyEventV2) {
        return SuccessResponse({ message: 'response from edit payment method' })
    }
}