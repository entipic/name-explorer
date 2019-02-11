
const debug = require('debug')('entipic:name-explorer');
import { findTitles, FindTitleOptions } from 'entity-finder';
import { countryName } from './country-name';
import { getEntities, convertToSimpleEntity, WikiEntity, WikidataPropsParam } from 'wiki-entity';
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

	return exploreEntity(titles.map(item => item.title), lang);
}

async function exploreEntity(titles: string[], lang: string) {
	let entities = await getEntities({
		titles,
		extract: 3,
		claims: 'item',
		language: lang,
		types: true,
		redirects: true,
		props: [
			WikidataPropsParam.info,
			WikidataPropsParam.labels,
			WikidataPropsParam.descriptions,
			WikidataPropsParam.datatype,
			WikidataPropsParam.claims,
			WikidataPropsParam.sitelinks,
		],
	});

	entities = entities.filter(item => !!item);

	if (!entities.length) {
		return;
	}

	const entity = createWebEntity(entities[0], lang);
	if (!entity) {
		return;
	}

	if (lang !== 'en' && entity.englishName) {
		const enEntity = await exploreEntity([entity.englishName], 'en');
		if (enEntity) {
			entity.description = enEntity.description || entity.description;
			entity.about = enEntity.about || entity.about;
			entity.popularity = enEntity.popularity > entity.popularity ? enEntity.popularity : entity.popularity;
		}
	}

	return entity;
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
		if (entity.sitelinks['en'] && lang !== 'en') {
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
