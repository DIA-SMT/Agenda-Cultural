// @vitest-environment node
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { GET } from "./route";

const pedir = (...ruta: string[]) => GET(new Request("http://localhost/media"), { params: Promise.resolve({ ruta }) });

beforeAll(async () => {
  const dir = await mkdtemp(join(tmpdir(), "media-"));
  await mkdir(join(dir, "lugares", "casa"), { recursive: true });
  await writeFile(join(dir, "lugares", "casa", "foto.webp"), "imagen");
  await writeFile(join(dir, "lugares", "casa", "notas.txt"), "texto");
  await writeFile(join(dir, "..", "secreto.webp"), "no");
  process.env.MEDIA_DIR = dir;
});

describe("GET /media/[...ruta]", () => {
  it("serves files with their type and long caching", async () => {
    const respuesta = await pedir("lugares", "casa", "foto.webp");
    expect(respuesta.status).toBe(200);
    expect(respuesta.headers.get("content-type")).toBe("image/webp");
    expect(respuesta.headers.get("cache-control")).toContain("immutable");
    expect(await respuesta.text()).toBe("imagen");
  });

  it("refuses paths outside the media folder", async () => {
    expect((await pedir("..", "secreto.webp")).status).toBe(404);
    expect((await pedir("lugares", "..", "..", "secreto.webp")).status).toBe(404);
  });

  it("refuses unknown file types and missing files", async () => {
    expect((await pedir("lugares", "casa", "notas.txt")).status).toBe(404);
    expect((await pedir("lugares", "casa", "no-existe.webp")).status).toBe(404);
  });
});
