import { findWebEntity } from "./find-web-entity";
import { logger } from "./logger";
import { createUniquenames } from "./create-uniquenames";
import { findDbTopicId } from "./find-db-topic-id";
import { createNewTopic } from "./create-new-topic";
import { addUniqueNamesToTopic } from "./add-uniquenames-to-topic";
import { UnknownName } from "@entipic/domain";

const debug = require('debug')('entipic:name-explorer');

export async function find(unknownName: UnknownName) {
	debug('finding unknownName', unknownName.name, unknownName.lang);

	const webEntity = await findWebEntity(unknownName.name, unknownName.lang, unknownName.country);

	if (!webEntity) {
		logger.warn('Not found web entity for: ' + unknownName.name);
		if (unknownName.name.split(/ /g).length < 2) {
			return;
		}
	}


	const uniqueNames = createUniquenames(unknownName, webEntity);

	let topicId = await findDbTopicId(uniqueNames);
	if (!topicId) {
		const topic = await createNewTopic(unknownName, webEntity);
		if (!topic) {
			return;
		}
		topicId = topic.id;
	}

	await addUniqueNamesToTopic(topicId, uniqueNames);
}
