import test from "ava";
import { findWebEntity, getSimpleName } from "./find-web-entity";
import { SimpleEntityType } from "wiki-entity";

test("ro:SUA", async (t) => {
  const entity = await findWebEntity("SUA", "ro");
  if (!entity) {
    return t.fail("Not found entity!");
  }
  t.is(entity.type, SimpleEntityType.PLACE);
  t.is(entity.englishName, "United States");
});

test("ro:adrian ursu", async (t) => {
  const entity = await findWebEntity("adrian ursu", "ro");
  if (!entity) {
    return t.fail("Not found entity!");
  }
  t.is(entity.simpleName, "Adrian Ursu");
});

test("ro:md:adrian ursu", async (t) => {
  const entity = await findWebEntity("adrian ursu", "ro", "md");
  if (!entity) {
    return t.fail("Not found entity!");
  }
  t.is(entity.name, "Adrian Ursu (cântăreț)");
});

test("ro:md:ministerul muncii", async (t) => {
  const entity = await findWebEntity("ministerul muncii", "ro", "md");
  if (!entity) {
    return t.fail("Not found entity!");
  }
  t.true(
    entity.wikiPageTitle && entity.wikiPageTitle.includes("Republica Moldova")
  );
});

test("ro-md:Chișinău", async (t) => {
  const entity = await findWebEntity("Chișinău", "ro", "md");
  if (!entity) {
    return t.fail("Not found entity!");
  }
  // console.log(entity)
  t.is(entity.type, SimpleEntityType.PLACE);
  t.is(entity.englishName, "Chișinău");
});

test("getSimpleName", (t) => {
  t.is(getSimpleName("Name (aha)"), "Name");
});
