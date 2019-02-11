require('dotenv').config();

import { initData, closeData, unknownNameRepository } from "./data";
import { logger } from "./logger";
import { find } from "./find";
import { delay } from "./helpers";

async function start() {
    await initData();

    const names = await unknownNameRepository.oldest({ limit: 25 });

    for (const name of names) {
        try {
            await find(name);
        } catch (e) {
            logger.error(e);
        }
        await unknownNameRepository.delete(name.id);

        await delay(1000 * 2);
    }
}

start()
    .catch(e => logger.error(e))
    .then(() => closeData());
