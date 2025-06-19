import { Logger } from "../utils/Logger.js";
import axios from "axios";
import { API_BASE_URL } from "../config/api.js";

const logger = new Logger("UserService");

export interface User {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    is_active: boolean;
}

export class UserService {
    /**
     * Получает список всех активных пользователей
     */
    static async getAllActiveUsers(): Promise<User[]> {
        try {
            const response = await axios.get(`${API_BASE_URL}/users/active`);
            return response.data;
        } catch (error) {
            logger.logError("Ошибка при получении списка пользователей", error);
            throw error;
        }
    }

    /**
     * Получает количество активных пользователей
     */
    static async getActiveUsersCount(): Promise<number> {
        try {
            const response = await axios.get(`${API_BASE_URL}/users/active/count`);
            return response.data.count;
        } catch (error) {
            logger.logError("Ошибка при получении количества пользователей", error);
            throw error;
        }
    }
} 