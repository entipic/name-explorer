import test from "ava";
import { findImagesOnGoogle } from "./google-images";

test("findImagesOnGoogle:Chișinău", async (t) => {
  const images = await findImagesOnGoogle("SUA", "ro");
  t.true(images.length > 1);
});
