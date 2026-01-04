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

// this example is giga-omega-simplified so don't judge it harshly
const sourceID = Bun.env.SOURCE_ID as string
const fetchLink = Bun.env.FETCH_LINK as string;
let lastAnnId: bigint = BigInt(0);

export default async function pollNews() {
    try {
        const response = await fetch(fetchLink);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json() as BitgetData;
        logger.info(`Fetched symbols data: ${data}`);

        data.data.sort((a, b) => (b.annId > a.annId ? 1 : b.annId < a.annId ? -1 : 0));
        const latestNews = data.data[0];
        if (!latestNews || latestNews.annId === lastAnnId) {
            logger.info("No new announcements.");
            return;
        }

        const prevAnnId = lastAnnId;
        lastAnnId = latestNews.annId;
        logger.info(`New announcement found: ${latestNews.annTitle} (ID: ${latestNews.annId})`);

        for (const news of data.data) {
            if (news.annId <= prevAnnId) {
                return
            }

            logger.info(`news from ${sourceID}: ${news}`)

            logger.info(`Processing announcement: ${news.annTitle} (ID: ${news.annId})`);
            const event: NewsEvent = create(NewsEventSchema, {
                sourceId: sourceID,
                title: "",
                content:  news.annTitle,
                publishedAt: news.cTime,
            });
            await kp.sendProtoNewsEvent(event);
        }

    } catch (error) {
        logger.error(`Error polling symbols: ${error}`);
    }
}
