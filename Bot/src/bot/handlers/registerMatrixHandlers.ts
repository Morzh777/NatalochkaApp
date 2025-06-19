// handlers/registerMatrixHandlers.ts
import {Bot} from "grammy";
import {matrixHandlers, registerPurposeNumberHandler} from "./matrixHandlers.js";
import {Logger} from "../../utils/Logger.js";
import {BotContext} from "../BotSettings.js";


export function registerMatrixHandlers(bot: Bot<BotContext>, logger: Logger) {
    matrixHandlers.forEach(({callbackKey, field, path}) =>
        registerPurposeNumberHandler(bot, callbackKey, field, path, logger)
    );
}
