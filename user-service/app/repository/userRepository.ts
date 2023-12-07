import { ProfileDto } from './../models/dto/AddressDto';
import { UserModel } from "../models/UserModel";
import { DBClient } from "../databases/databaseClient";
import { DBOperation } from "../databases/dbOperation";
import { AddressModel } from 'app/models/AddressModel';

export class UserRepository extends DBOperation {
    constructor() {
        super();
    }

    async createAccount({
        phone,
        email,
        password = "",
        salt = "",
        userType,
    }: UserModel) {
        const values = [
            phone,
            email,
            password,
            salt,
            userType,
        ];
        const queryString =
            "INSERT INTO users(phone, email, password, salt, user_type) VALUES($1,$2,$3,$4,$5) RETURNING *";
        const result = await this.executeQuery(queryString, values);
        if (result.rowCount > 0) {
            return result.rows[0] as UserModel;
        }
    }

    async findAccount(email: string) {
        const client = await DBClient();
        await client.connect();
        const values = [email];
        const queryString =
            "SELECT user_id, email, password, phone , salt, verification_code, expiry FROM users WHERE email=$1";
        const result = await this.executeQuery(queryString, values);
        if (result.rowCount < 1) {
            throw new Error("user does not exist with provided email id!");
        }
        return result.rows[0] as UserModel;
    }

    async updateVerificationCode(userId: number, code: number, expiry: Date) {
        const queryString =
            "UPDATE users SET verification_code=$1,expiry=$2 WHERE user_id=$3 RETURNING *";
        const values = [code, expiry, userId];
        const result = await this.executeQuery(queryString, values);
        if (result.rowCount > 0) {
            return result.rows[0] as UserModel;
        }
    }

    async updateVerifyUser(userId: number) {
        const queryString =
            "UPDATE users SET verified=TRUE WHERE user_id=$1 AND verified=FALSE  RETURNING *";
        const values = [userId];
        const result = await this.executeQuery(queryString, values);
        if (result.rowCount > 0) {
            return result.rows[0] as UserModel;
        }
        throw new Error("user already verified!");
    }

    async updateUser(
        user_id: number,
        firstName: string,
        lastName: string,
        userType: string
    ) {
        const queryString =
            "UPDATE users SET first_name=$1, last_name=$2, user_type=$3 WHERE user_id=$4 RETURNING *";
        const values = [firstName, lastName, userType, user_id];
        const result = await this.executeQuery(queryString, values);
        if (result.rowCount > 0) {
            return result.rows[0] as UserModel;
        }
        throw new Error("error while update user!");
    }

    async createProfile(
        user_id: number,
        {
            firstName,
            lastName,
            userType,
            address: { addressLine1, addressLine2, city, postCode, country },
        }: ProfileDto
    ) {
        await this.updateUser(
            user_id,
            firstName,
            lastName,
            userType,
        )
        const queryString = "INSERT INTO address(user_id, address_line1, address_line2, city, post_code,country) VALUES($1,$2,$3,$4,$5,$6) RETURNING *";
        const values = [user_id, addressLine1, addressLine2, city, postCode, country];
        const result = await this.executeQuery(queryString, values);
        if (result.rowCount > 0) {
            return result.rows[0] as UserModel;
        }
        throw new Error("error while creating profile")
    }

    async getUserProfile(user_id: number) {
        const profileQuery = "SELECT first_name, last_name, email, phone, user_type, verified FROM users WHERE user_id=$1"
        const profileValues = [user_id];

        const profileResult = await this.executeQuery(profileQuery, profileValues);
        if (profileResult.rowCount < 1) {
            throw new Error("user profile does not exist");
        }
        const userProfile = profileResult.rows[0] as UserModel;
        const addressQuery = "SELECT id,address_line1,address_line2,city, post_code,country FROM address WHERE user_id=$1"
        const addressValue = [user_id];
        const addressResult = await this.executeQuery(addressQuery, addressValue)
        if (addressResult.rowCount > 0) {
            userProfile.address = addressResult.rows[0] as AddressModel[]
        }
        return userProfile
    }

    async updateProfile(
        user_id: number,
        {
            firstName,
            lastName,
            userType,
            address: { addressLine1, addressLine2, city, postCode, country, id },
        }: ProfileDto
    ) {
        await this.updateUser(user_id, firstName, lastName, userType)
        const addressQuery = "UPDATE address SET address_line1 =$1, address_line2 =$2, city=$3, post_code=$4, country=$5 WHERE id=$6";
        const addressValues = [
            addressLine1,
            addressLine2,
            city,
            postCode,
            country,
            id
        ]
        const addressResult = await this.executeQuery(addressQuery, addressValues)
        if (addressResult.rowCount < 1) {
            throw new Error("error while updating profile")
        }
        return true;
    }
}
