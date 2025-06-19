// 📍 Универсальная функция загрузки описания
import {Logger} from "./Logger.js";
import axios from "axios";

export async function fetchDescription(url: string, logger: Logger) {
    try {
        const res = await axios.get(url);
        return res.data;
    } catch (err: any) {
        const errorData = JSON.stringify(err.response?.data || err.message || err, null, 2);
        const statusCode = err.response?.status;
        logger.logError(`❌ Ошибка загрузки данных [${statusCode}]:`, errorData);
        throw new Error('Ошибка загрузки данных');
    }
}