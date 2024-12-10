import { createUniquenames } from "./create-uniquenames";
import { findDbTopicId } from "./find-db-topic-id";
import { createNewTopic } from "./create-new-topic";
import { addUniqueNamesToTopic } from "./add-uniquenames-to-topic";
import { UnknownName } from "@entipic/domain";

const debug = require("debug")("entipic:name-explorer");

export async function find(unknownName: UnknownName) {
  debug("finding unknownName", unknownName.name, unknownName.lang);

  const uniqueNames = createUniquenames(unknownName);

  let topicId = await findDbTopicId(uniqueNames);
  if (!topicId) {
    const topic = await createNewTopic(unknownName);
    if (!topic) {
      return;
    }
    topicId = topic.id;
  }

  await addUniqueNamesToTopic(topicId, uniqueNames);
}
