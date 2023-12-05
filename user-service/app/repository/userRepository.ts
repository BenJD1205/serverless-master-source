import { UserModel } from "../models/UserModel";
import { DBClient } from "../databases/databaseClient";
import { DBOperation } from "../databases/dbOperation";

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
        first_name = "",
        last_name = "",
        profile_pic = "",
    }: UserModel) {
        const values = [phone, email, password, salt, userType, first_name, last_name, profile_pic];
        const queryString =
            "INSERT INTO users(phone, email, password, salt, user_type,first_name,last_name, profile_pic) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *";
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

    async updateVerificationCode(userId: string, code: number, expiry: Date) {
        const queryString =
            "UPDATE users SET verification_code=$1,expiry=$2 WHERE user_id=$3 RETURNING *";
        const values = [code, expiry, userId];
        const result = await this.executeQuery(queryString, values);
        if (result.rowCount > 0) {
            return result.rows[0] as UserModel;
        }
    }
}
