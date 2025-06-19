import { BotContext } from '../bot/BotSettings.js';

export function getProfileInfo(ctx: BotContext): { name: string; birthDate: string } {
    return {
        name: ctx.session.activeMatrix?.name || '—',
        birthDate: ctx.session.activeMatrix?.birthDate || '—',
    };
}