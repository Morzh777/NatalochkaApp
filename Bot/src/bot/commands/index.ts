import { Bot } from "grammy";

import { registerStartCommand } from "./start.command.js";
import { registerSquareCommand } from "./square.command.js";
import { registerHistoryCommand } from "./history.command.js";
import { registerCompatibilityCommand } from "./compatibility.command.js";
import { registerMenuCommand } from "./menu.command.js";
import { registerProfileCommand } from "./profile.command.js";
import { registerDescriptionCommand } from "./description.command.js";
import { registerFallbacks } from "./fallback.command.js";
import {BotContext} from "../BotSettings.js";
import {registerBuyCommand} from "./pay.commands.js";
import {registerRefundCommand} from "./refund.command.js";
import {registerMatrixCommand} from "./matrix.command.js";
import {registerMatrixHistoryCommand} from "./matrix.history.command.js";

export function registerCommands(bot: Bot<BotContext>) {
    registerStartCommand(bot);
    registerBuyCommand(bot);
    registerMatrixCommand(bot);
    registerSquareCommand(bot);
    registerHistoryCommand(bot);
    registerMatrixHistoryCommand(bot);
    registerCompatibilityCommand(bot);
    registerMenuCommand(bot);
    registerProfileCommand(bot);
    registerDescriptionCommand(bot);
    registerRefundCommand(bot);
}

