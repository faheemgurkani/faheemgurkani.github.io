/**
 * Build-time script: fetches GitHub repos and writes data for optional
 * static/build-time usage. Hybrid component uses client-side fetch by default.
 * Run: npm run fetch-projects
 */
import * as fs from 'fs';
import * as path from 'path';

const GITHUB_USERNAME = 'faheemgurkani';
const GITHUB_API = 'https://api.github.com';

async function fetchRepos(): Promise<unknown[]> {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    ...(token && { Authorization: `token ${token}` }),
  };
  const res = await fetch(
    `${GITHUB_API}/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated&type=owner`,
    { headers }
  );
  if (!res.ok) throw new Error(`GitHub API: ${res.status}`);
  return res.json();
}

async function main() {
  const repos = await fetchRepos();
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const outPath = path.join(dataDir, 'github-projects.json');
  fs.writeFileSync(outPath, JSON.stringify(repos, null, 2), 'utf-8');
  console.log(`Wrote ${repos.length} repos to ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
