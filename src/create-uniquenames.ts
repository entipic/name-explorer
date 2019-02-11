import { UnknownName, UniqueNameHelper, uniqByProperty } from "@entipic/domain";
import { WebEntity, SimpleUniqueName } from "./types";


export function createUniquenames(unknownName: UnknownName, entity?: WebEntity) {
	const uniquenames: SimpleUniqueName[] = [];
	const lang = unknownName.lang;
	const country = unknownName.country;

	function add(un: SimpleUniqueName) {
		if (un.name[0] === '.') {
			return;
		}
		uniquenames.push(un);
	}

	if (entity) {
		add(UniqueNameHelper.build({
			lang: entity.lang || lang, name: entity.name, pictureId: '', topicId: ''
		}));

		// entity.names.forEach(name => {
		// 	add({
		// 		name: name,
		// 		lang: lang,
		// 		id: Model.uniqueNameId(name, lang),
		// 		uniqueName: Model.uniqueName(name)
		// 	});
		// });

		if (entity.englishName) {
			add(UniqueNameHelper.build({
				lang: 'en', name: entity.englishName, pictureId: '', topicId: ''
			}));
		}

		if (country && entity.simpleName) {
			add(UniqueNameHelper.build({
				lang, country, name: entity.simpleName, pictureId: '', topicId: ''
			}));
		}
	}

	if (country) {
		add(UniqueNameHelper.build({
			lang, country, name: unknownName.name, pictureId: '', topicId: ''
		}));
	} else {
		add(UniqueNameHelper.build({
			lang, name: unknownName.name, pictureId: '', topicId: ''
		}));
	}

	return uniqByProperty(uniquenames, 'id');
}
