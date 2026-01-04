import logger from "./src/utils/logger.ts";
import { uuidv7 } from "uuidv7";

function generateUUIDv7(): string {
    logger.info("Generating UUID v7");
    return uuidv7();
}

logger.info(generateUUIDv7());