import logger from "../utils/logger.ts";
import {Kafka, Partitioners, type Producer} from "kafkajs";
import {type NewsEvent, NewsEventSchema} from "../entities/proto/news/news_pb.ts";
import {toBinary} from '@bufbuild/protobuf';

class KafkaProducer {
    private producer: Producer;
    private readonly defaultTopic: string;

    constructor(kafkaSeeds: string[], kafkaClientID: string, defaultTopic: string) {
        const kafkaConfig: any = {
            clientId: kafkaClientID,
            brokers: kafkaSeeds
        };

        if (Bun.env.KAFKA_USERNAME && Bun.env.KAFKA_PASSWORD) {
            kafkaConfig.sasl = {
                mechanism: 'plain',
                username: Bun.env.KAFKA_USERNAME,
                password: Bun.env.KAFKA_PASSWORD
            };
        }

        const kafka = new Kafka(kafkaConfig);

        this.producer = kafka.producer({
            createPartitioner: Partitioners.DefaultPartitioner,
        });

        this.defaultTopic = defaultTopic;
    }

    async connect() {
        await this.producer.connect();
        logger.info("Connected to Kafka");
    }

    async sendProtoNewsEvent(event: NewsEvent) {
        const binaryData = toBinary(NewsEventSchema, event);

        await this.producer.send({
            topic: this.defaultTopic,
            messages: [
                {
                    value: Buffer.from(binaryData),
                },
            ],
        });
    }

    async disconnect() {
        await this.producer.disconnect();
        logger.info("Disconnected from Kafka");
    }
}

const kp = new KafkaProducer(
    Bun.env.KAFKA_BROKERS ? Bun.env.KAFKA_BROKERS!.split(",") : ["localhost:9092"],
    Bun.env.KAFKA_CLIENT_ID || "bitget-producer",
    Bun.env.KAFKA_DEFAULT_TOPIC || "newsevents"
);

try {
    await kp.connect();
} catch (error) {
    logger.fatal(`Error connecting to Kafka: ${error}`, () => {
        process.exit(1);
    });
}

export default kp;