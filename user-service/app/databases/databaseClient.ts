import { Client } from "pg";
import { config } from '../config/config';

export const DBClient = () => {
    return new Client({
        host: config.database.host,
        user: config.database.user,
        database: config.database.database,
        password: config.database.password,
        port: config.database.port,
    })
}