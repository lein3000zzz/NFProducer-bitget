import logger from "../utils/logger.ts";
import kp from "../producer/kafkaProducer.ts";
import {type NewsEvent, NewsEventSchema} from "../entities/proto/news/news_pb.ts";
import {create} from "@bufbuild/protobuf";

interface SingleNews {
    annId: bigint;
    annTitle: string;
    cTime: bigint;
}

interface BitgetData {
    data: SingleNews[]
}

const sourceID = Bun.env.SOURCE_ID as string;
const baseFetchLink = Bun.env.FETCH_LINK as string;
const annTypes = ["latest_news", "coin_listings", "product_updates", "security", "api_trading", "maintenance_system_updates", "symbol_delisting"];
const lastAnnIds: Record<string, bigint> = {};

export default async function pollNews() {
    for (const annType of annTypes) {
        try {
            const fetchLink = `${baseFetchLink}&annType=${annType}`;
            const response = await fetch(fetchLink);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json() as BitgetData;
            logger.info(`Fetched data for ${annType}: ${data}`);

            data.data.sort((a, b) => (b.annId > a.annId ? 1 : b.annId < a.annId ? -1 : 0));
            const latestNews = data.data[0];
            if (!latestNews || latestNews.annId === (lastAnnIds[annType] || BigInt(0))) {
                logger.info(`No new announcements for ${annType}.`);
                continue;
            }

            const prevAnnId = lastAnnIds[annType] || BigInt(0);
            lastAnnIds[annType] = latestNews.annId;
            logger.info(`New announcement found for ${annType}: ${latestNews.annTitle} (ID: ${latestNews.annId})`);

            for (const news of data.data) {
                if (news.annId <= prevAnnId) {
                    break;
                }

                logger.info(`news from ${sourceID} for ${annType}: ${news}`);

                logger.info(`Processing announcement for ${annType}: ${news.annTitle} (ID: ${news.annId})`);
                const event: NewsEvent = create(NewsEventSchema, {
                    sourceId: sourceID,
                    title: "category " + annType.replace("_", " ") + ": ",
                    content: news.annTitle,
                    publishedAt: news.cTime,
                });
                await kp.sendProtoNewsEvent(event);
            }

        } catch (error) {
            logger.error(`Error polling for ${annType}: ${error}`);
        }
    }
}
