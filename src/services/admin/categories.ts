import type { Query } from "@/lib/db";
import type { PublicationStatus } from "@/types/domain";

export interface CategoryAdmin {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  description: string | null;
  status: PublicationStatus;
  events: number;
}

export interface CategoryInput {
  name: string;
  slug: string;
  color: string | null;
  description: string | null;
  status: PublicationStatus;
}

const columns = `c.id, c.name, c.slug, c.color, c.description, c.status,
  (select count(*) from public.event_categories ec where ec.category_id = c.id)::int as events`;

export async function listCategories(query: Query) {
  return query<CategoryAdmin>(`select ${columns} from public.categories c order by c.name`);
}

export async function getCategory(query: Query, id: string) {
  const [row] = await query<CategoryAdmin>(`select ${columns} from public.categories c where c.id = $1`, [id]);
  return row ?? null;
}

export async function saveCategory(query: Query, input: CategoryInput, id?: string) {
  const values = [input.name, input.slug, input.color, input.description, input.status];
  const [row] = id
    ? await query<{ id: string }>(`
        update public.categories set name = $1, slug = $2, color = $3, description = $4, status = $5
        where id = $6 returning id`, [...values, id])
    : await query<{ id: string }>(`
        insert into public.categories (name, slug, color, description, status)
        values ($1, $2, $3, $4, $5) returning id`, values);
  return row?.id ?? null;
}

/** Borra la categoría; los eventos que la tenían simplemente la pierden. */
export async function deleteCategory(query: Query, id: string) {
  await query("delete from public.categories where id = $1", [id]);
}
