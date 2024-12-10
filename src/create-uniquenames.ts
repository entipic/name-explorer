import { UnknownName, UniqueNameHelper, uniqByProperty } from "@entipic/domain";
import { SimpleUniqueName } from "./types";

export function createUniquenames(unknownName: UnknownName) {
  const uniquenames: SimpleUniqueName[] = [];
  const lang = unknownName.lang;
  const country = unknownName.country;

  function add(un: SimpleUniqueName) {
    if (un.name[0] === ".") {
      return;
    }
    uniquenames.push(un);
  }

  if (country) {
    add(
      UniqueNameHelper.build({
        lang,
        country,
        name: unknownName.name,
        pictureId: "",
        topicId: ""
      })
    );
  } else {
    add(
      UniqueNameHelper.build({
        lang,
        name: unknownName.name,
        pictureId: "",
        topicId: ""
      })
    );
  }

  return uniqByProperty(uniquenames, "id");
}
