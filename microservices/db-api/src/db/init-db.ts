import { getDB, closeDB } from "./database";

(async () => {
    await getDB();
    console.log("✅ База данных успешно создана/обновлена.");
    await closeDB();
})();
