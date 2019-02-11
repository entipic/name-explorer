import { logger } from './logger';
import { SimpleUniqueName } from './types';
import { topicRepository, uniqueNameRepository } from './data';
import { UniqueNameHelper } from '@entipic/domain';

export async function addUniqueNamesToTopic(topicId: string, uniqueNames: SimpleUniqueName[]) {
	const topic = await topicRepository.getById(topicId);

	if (!topic) {
		return Promise.reject(new Error('Cannot find topic id=' + topicId));
	}

	const list = []

	for (const un of uniqueNames) {
		const uniqueName = UniqueNameHelper.build({
			name: un.name,
			lang: un.lang,
			country: un.country,
			pictureId: topic.pictureId,
			topicId: topic.id,
		});

		try {
			const item = await uniqueNameRepository.create(uniqueName);
			list.push(item);
		} catch (error) {
			//unique name exists
			if (error.code === 11000) {
				logger.warn('unique name exists: ' + un.name);
			} else {
				logger.error(error);
			}
		}
	}

	return list;
}
