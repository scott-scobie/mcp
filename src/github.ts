const GITHUB_API = "https://api.github.com";

function getToken(): string {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN is not set. Add it to your .env file.");
  }
  return token;
}

export async function githubFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${getToken()}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

interface GitHubRepo {
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  updated_at: string;
}

interface GitHubIssue {
  number: number;
  title: string;
  html_url: string;
  user: { login: string };
  pull_request?: unknown;
}

interface GitHubPullRequest {
  number: number;
  title: string;
  html_url: string;
  user: { login: string };
}

export async function listMyRepos(limit = 10): Promise<string> {
  const repos = await githubFetch<GitHubRepo[]>(
    `/user/repos?sort=updated&per_page=${limit}`
  );

  if (repos.length === 0) {
    return "No repositories found for your account.";
  }

  return repos
    .map(
      (repo) =>
        `- ${repo.full_name}${repo.private ? " (private)" : ""}\n  ${repo.description ?? "No description"}\n  Updated: ${repo.updated_at}\n  ${repo.html_url}`
    )
    .join("\n\n");
}

export async function listOpenIssues(
  owner: string,
  repo: string,
  limit = 20
): Promise<string> {
  const issues = await githubFetch<GitHubIssue[]>(
    `/repos/${owner}/${repo}/issues?state=open&per_page=${limit}`
  );

  const openIssues = issues.filter((issue) => !issue.pull_request);

  if (openIssues.length === 0) {
    return `No open issues in ${owner}/${repo}.`;
  }

  return openIssues
    .map(
      (issue) =>
        `- #${issue.number}: ${issue.title} (@${issue.user.login})\n  ${issue.html_url}`
    )
    .join("\n\n");
}

export async function listOpenPullRequests(
  owner: string,
  repo: string,
  limit = 20
): Promise<string> {
  const pulls = await githubFetch<GitHubPullRequest[]>(
    `/repos/${owner}/${repo}/pulls?state=open&per_page=${limit}`
  );

  if (pulls.length === 0) {
    return `No open pull requests in ${owner}/${repo}.`;
  }

  return pulls
    .map(
      (pr) =>
        `- #${pr.number}: ${pr.title} (@${pr.user.login})\n  ${pr.html_url}`
    )
    .join("\n\n");
}
