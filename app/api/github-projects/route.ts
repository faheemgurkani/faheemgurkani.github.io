import { NextResponse } from 'next/server';
import { fetchGitHubRepos } from '../../../lib/github';

/**
 * Required with `output: "export"` in next.config (Next.js 15+).
 * @see https://nextjs.org/docs/app/building-your-application/deploying/static-exports
 */
export const dynamic = 'force-static';

/**
 * Server-side API route: fetches GitHub projects using GITHUB_TOKEN from .env.local.
 * The token is only available on the server, so the client calls this route instead
 * of the GitHub API directly.
 */
export async function GET() {
  try {
    const projects = await fetchGitHubRepos();
    return NextResponse.json(projects);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to fetch projects';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
