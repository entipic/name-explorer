
const debug = require('debug')('finder');
import { findTitles, FindTitleOptions } from 'entity-finder';
import { countryName } from './country-name';
import { getEntities, convertToSimpleEntity, WikiEntity } from 'wiki-entity';
import { WebEntity } from './types';

export async function findWebEntity(name: string, lang: string, country?: string) {

	debug('finding entity:' + name, lang);

	const options: FindTitleOptions = { limit: 2, orderByTagsLimit: 1 };

	if (country) {
		country = countryName(country, lang);
		if (country) {
			options.tags = [country];
		}

		debug('finding name with tags', options.tags);
	}
	const titles = await findTitles(name, lang, options);
	if (!titles.length) {
		debug('NOT found entity for: ' + name);
		return;
	}

	const entities = await getEntities({
		titles: titles.map(item => item.title),
		extract: 3,
		claims: 'item',
		language: lang,
		types: true,
		redirects: true,
	});

	if (!entities.length) {
		debug('NOT found entity for: ' + name);
		return;
	}

	return createWebEntity(entities[0], lang);
}

function createWebEntity(entity: WikiEntity, lang: string) {
	const webEntity = convertToSimpleEntity(entity, lang) as WebEntity;
	webEntity.name = webEntity.wikiPageTitle || webEntity.name;

	if (!webEntity.name) {
		return;
	}

	webEntity.popularity = Object.keys(entity.sitelinks || {}).length * 10;
	webEntity.popularity += Object.keys(entity.claims || {}).length;

	if (entity.sitelinks) {
		if (entity.sitelinks['en']) {
			webEntity.englishName = entity.sitelinks['en'];
		}
	}

	webEntity.simpleName = getSimpleName(webEntity.name)

	if (entity.redirects) {
		webEntity.names = entity.redirects;
	}

	return webEntity;
}

export function getSimpleName(name: string) {
	const result = /(.+)\s+\(.+\)$/.exec(name);

	if (result) {
		return result[1];
	}
}
