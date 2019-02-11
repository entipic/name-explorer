require('dotenv').config();

import { initData, closeData, unknownNameRepository } from "./data";
import { logger } from "./logger";
import { find } from "./find";
import { delay } from "./helpers";

const NAMES_LIMIT = process.env.NAMES_LIMIT && parseInt(process.env.NAMES_LIMIT) || 100;

async function start() {
    logger.warn('Starting...');
    await initData();

    const names = await unknownNameRepository.oldest({ limit: NAMES_LIMIT });

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
    .then(() => closeData())
    .then(() => logger.warn('END'));
