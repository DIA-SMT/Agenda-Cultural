// @vitest-environment node
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { MAX_UPLOAD_BYTES, saveImage, UploadError } from "./media-upload";

let dir = "";
beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), "subidas-"));
  process.env.MEDIA_DIR = dir;
});

const file = (bytes: number[], name = "foto") => new File([new Uint8Array(bytes)], name);
const JPEG = [0xff, 0xd8, 0xff, 0xe0, 0, 0x10];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const WEBP = [...Buffer.from("RIFF"), 0, 0, 0, 0, ...Buffer.from("WEBPVP8 ")];

describe("saveImage", () => {
  it("stores images under a new name by content type", async () => {
    for (const [bytes, extension] of [[JPEG, ".jpg"], [PNG, ".png"], [WEBP, ".webp"]] as const) {
      const path = await saveImage(file([...bytes]), "eventos");
      expect(path).toMatch(new RegExp(`^/media/eventos/\\d{4}/[0-9a-f-]{36}\\${extension}$`));
      expect([...await readFile(join(dir, path.replace("/media/", "")))]).toEqual([...bytes]);
    }
  });

  it("rejects files that are not images even if they say so", async () => {
    await expect(saveImage(file([...Buffer.from("<script>alert(1)</script>")], "foto.jpg"), "lugares")).rejects.toBeInstanceOf(UploadError);
  });

  it("rejects files over the limit", async () => {
    await expect(saveImage(new File([new Uint8Array(MAX_UPLOAD_BYTES + 1)], "grande.jpg"), "lugares")).rejects.toThrow("10 MB");
  });
});
