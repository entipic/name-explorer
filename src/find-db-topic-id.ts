import { TopicHelper } from "@entipic/domain";
import { topicRepository, uniqueNameRepository } from "./data";
import { SimpleUniqueName } from "./types";

export async function findDbTopicId(uniqueNames: SimpleUniqueName[]) {
  const namesByLanguage = uniqueNames
    .filter((un) => !un.country)
    .map((item) => item.id);
  const namesByCountry = uniqueNames
    .filter((un) => !!un.country)
    .map((item) => item.id);

  if (namesByCountry.length) {
    const idByCountry = await getTopicId(namesByCountry, []);
    if (idByCountry) return idByCountry;
  }

  const slugs = uniqueNames.map((item) =>
    TopicHelper.slug(item.name, item.lang)
  );

  return getTopicId(namesByLanguage, slugs);
}

async function getTopicId(ids: string[], slugs: string[]) {
  if (ids.length === 0) {
    return null;
  }
  const uniqueNames = await uniqueNameRepository.getByIds(ids);

  if (uniqueNames.length) {
    return uniqueNames[0].topicId;
  }
  for (const slug of slugs) {
    const topic = await topicRepository.topicBySlug(slug);
    if (topic) {
      return topic.id || ((topic as any)._id as string);
    }
  }
  return null;
}
