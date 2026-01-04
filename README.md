# nfproducer-bitget

A Bun-based TypeScript producer that polls news events from the Bitget exchange and publishes them to Apache Kafka using Protocol Buffers for serialization. 
This repository is a direct implementation of the [bun template](https://github.com/lein3000zzz/NFProducer-template-bun)

### Related topics

1. [NewsFinder](https://github.com/lein3000zzz/NewsFinder) - The main Go-based consumer and analyzer.

2. [News Producer Bitget Example](https://github.com/lein3000zzz/NFProducer-template-bun) - The template this project is based on.

3. [NewsAnalyzed Consumer Bun Template](https://github.com/lein3000zzz/NFConsumer-template-bun)

4. [The Telegram Bot](https://t.me/crypto_NewsFinderBot)

### Features

- Periodic news polling from Bitget REST endpoints
- Kafka production with configurable brokers, topic, and client ID
- Protobuf message serialization for efficient, typed messages
- Configurable logging levels via Logtape
- Utility for generating UUIDv7 source identifiers

### You can find all the details in the [template README](https://github.com/lein3000zzz/NFProducer-template-bun)