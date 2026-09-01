export interface GitHubRepo {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  language: string | null;
  pushed_at: string;
  archived: boolean;
  fork: boolean;
  private: boolean;
  topics: string[];
}

const OWNER = process.env.GITHUB_OWNER ?? "alianzaeducacionrural";

/** Trae los repos del owner. Revalida cada hora (ISR). */
export async function fetchRepos(): Promise<GitHubRepo[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  // /users/:owner/repos funciona para usuarios y organizaciones públicas.
  const url = `https://api.github.com/users/${OWNER}/repos?per_page=100&sort=updated&type=owner`;

  try {
    const res = await fetch(url, { headers, next: { revalidate: 3600 } });
    if (!res.ok) {
      console.error(`GitHub API ${res.status}: ${await res.text()}`);
      return [];
    }
    const data = (await res.json()) as GitHubRepo[];
    return data
      .filter((r) => !r.fork)
      .map((r) => ({ ...r, topics: r.topics ?? [] }));
  } catch (err) {
    console.error("No se pudo consultar GitHub:", err);
    return [];
  }
}
