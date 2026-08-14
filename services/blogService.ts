import api from "../utils/api";

/* ── Posts ───────────────────────────────────────────────────────────── */

export async function getAdminBlogPosts(params: string): Promise<unknown> {
  const res = await api.get(`/admin/blog?${params}`);
  return res.data;
}

export async function getAdminBlogPost(postId: string | number): Promise<unknown> {
  const res = await api.get(`/admin/blog/${postId}`);
  return res.data.data;
}

/* POST /admin/blog — create (multipart form) */
export async function createBlogPost(fd: FormData): Promise<void> {
  await api.post("/admin/blog", fd);
}

/* POST /admin/blog/:id (method-spoofed) — update (multipart form) */
export async function updateBlogPost(
  id: string | number,
  fd: FormData
): Promise<void> {
  await api.post(`/admin/blog/${id}`, fd);
}

export async function deleteBlogPost(id: string | number): Promise<void> {
  await api.delete(`/admin/blog/${id}`);
}

/* ── Categories / Tags ───────────────────────────────────────────────── */

export type TaxonomyType = "category" | "tag";

function taxonomyEndpoint(type: TaxonomyType): string {
  return type === "category" ? "/admin/blog/categories" : "/admin/blog/tags";
}

export async function getBlogCategories(): Promise<unknown[]> {
  const res = await api.get("/admin/blog/categories");
  return res.data.data ?? [];
}

export async function getBlogTags(): Promise<unknown[]> {
  const res = await api.get("/admin/blog/tags");
  return res.data.data ?? [];
}

export async function addTaxonomyItem(
  type: TaxonomyType,
  name: string
): Promise<void> {
  await api.post(taxonomyEndpoint(type), { name });
}

export async function deleteTaxonomyItem(
  type: TaxonomyType,
  id: string | number
): Promise<void> {
  await api.delete(`${taxonomyEndpoint(type)}/${id}`);
}
