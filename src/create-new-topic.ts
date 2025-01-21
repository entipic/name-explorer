import { logger } from "./logger";
import { createDbPictures } from "./create-db-pictures";
import { UnknownName, TopicHelper } from "@entipic/domain";
import { topicRepository } from "./data";

export async function createNewTopic(unknownName: UnknownName) {
  const pictures = await createDbPictures(unknownName);
  if (!pictures.length) {
    logger.warn(`No images for ${unknownName.name}`, unknownName);
    return;
  }
  const picture = pictures[0];

  let name = unknownName.name;
  let lang = unknownName.lang;

  const topic = TopicHelper.build({
    lang,
    name,
    pictureHost: picture.host,
    pictureId: picture.id,
    picturesIds: pictures.map((item) => item.id),
    refHost: unknownName.refHost,
    refIP: unknownName.refIP
  });

  logger.info("Creating new topic:" + topic.name);

  return topicRepository.create(topic);
}
