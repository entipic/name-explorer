
import { logger } from './logger';
import { createDbPictures } from './create-db-pictures';
import { UnknownName, TopicHelper, TopicType } from '@entipic/domain';
import { WebEntity } from './types';
import { SimpleEntityType } from 'wiki-entity';
import { topicRepository } from './data';

export async function createNewTopic(unknownName: UnknownName, webEntity?: WebEntity) {

	const pictures = await createDbPictures(unknownName, webEntity);
	if (!pictures.length) {
		return;
	}
	const picture = pictures[0];

	let name = unknownName.name;
	let lang = unknownName.lang;

	if (webEntity && lang !== 'en') {
		if (webEntity.englishName) {
			name = webEntity.englishName;
			lang = 'en';
		}
	}

	const topic = TopicHelper.build({
		description: webEntity && (webEntity.about || webEntity.description),
		type: webEntity && convertType(webEntity.type),
		wikiPageId: webEntity && webEntity.wikiPageId,
		wikiPageTitle: webEntity && webEntity.wikiPageTitle,
		lang,
		name,
		pictureHost: picture.host,
		pictureId: picture.id,
		picturesIds: pictures.map(item => item.id),
		popularity: webEntity && webEntity.popularity || 0,
		refHost: unknownName.refHost,
		refIP: unknownName.refIP,
	});

	logger.info('Creating new topic:' + topic.name);

	return topicRepository.create(topic);
}

function convertType(simpleType?: SimpleEntityType): TopicType | undefined {
	switch (simpleType) {
		case SimpleEntityType.ORG: return 'ORG';
		case SimpleEntityType.PLACE: return 'PLACE';
		case SimpleEntityType.PERSON: return 'PERSON';
		case SimpleEntityType.PRODUCT: return 'PRODUCT';
		case SimpleEntityType.EVENT: return 'EVENT';
	}
}
