import { createUniquenames } from "./create-uniquenames";
import { findDbTopicId } from "./find-db-topic-id";
import { createNewTopic } from "./create-new-topic";
import { addUniqueNamesToTopic } from "./add-uniquenames-to-topic";
import { TopicHelper, UnknownName } from "@entipic/domain";
import { topicRepository } from "./data";

const debug = require("debug")("entipic:name-explorer");

export async function find(unknownName: UnknownName) {
  debug("finding unknownName", unknownName.name, unknownName.lang);

  const uniqueNames = createUniquenames(unknownName);

  let topicId = await findDbTopicId(uniqueNames);
  if (!topicId) {
    const topic =
      (await topicRepository.topicBySlug(
        TopicHelper.slug(unknownName.name, unknownName.lang)
      )) || (await createNewTopic(unknownName));
    if (!topic) {
      debug("Cannot create topic for", unknownName);
      return;
    }
    // console.log("Created topic", topic);
    topicId = topic.id || ((topic as any)._id as string);
  }

  await addUniqueNamesToTopic(topicId, uniqueNames);
}
