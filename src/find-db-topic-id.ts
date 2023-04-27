import { uniqueNameRepository } from "./data";
import { SimpleUniqueName } from "./types";

export async function findDbTopicId(uniqueNames: SimpleUniqueName[]) {
  const namesByLanguage = uniqueNames
    .filter((un) => {
      return !un.country;
    })
    .map((item) => item.id);
  const namesByCountry = uniqueNames
    .filter((un) => {
      return !!un.country;
    })
    .map((item) => item.id);

  const idByLanguage = await getTopicId(namesByLanguage);
  if (idByLanguage) {
    return idByLanguage;
  }

  return getTopicId(namesByCountry);
}

async function getTopicId(ids: string[]) {
  if (ids.length === 0) {
    return null;
  }
  const uniqueNames = await uniqueNameRepository.getByIds(ids);

  if (uniqueNames.length) {
    return uniqueNames[0].topicId;
  }
  return null;
}
