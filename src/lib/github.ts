import { useEffect, useState } from 'react'
import { profile } from '../data'

/**
 * Live GitHub feed via the public REST API (runs in the visitor's browser, no token).
 * Requests per page view: 1 user + 1 repo list + commits for the 3 most recently
 * pushed repos = 5. Cached in sessionStorage for 10 minutes to stay well under
 * GitHub's 60 requests / hour / IP anonymous limit.
 */

export type FeedRepo = {
  name: string
  url: string
  description: string | null
  language: string | null
  stars: number
  pushedAt: string
}
export type FeedCommit = { sha: string; repo: string; message: string; date: string; url: string }
export type GithubFeed = { repos: FeedRepo[]; commits: FeedCommit[]; publicRepos: number; since: string; fetchedAt: number }

const CACHE_KEY = `gh-feed:${profile.githubUser}`
const TTL = 10 * 60 * 1000
const API = 'https://api.github.com'

type ApiRepo = {
  name: string
  html_url: string
  description: string | null
  language: string | null
  stargazers_count: number
  pushed_at: string
  fork: boolean
  size: number
}
type ApiCommit = { sha: string; html_url: string; commit: { message: string; author: { date: string } | null } }

async function getJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal, headers: { Accept: 'application/vnd.github+json' } })
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json() as Promise<T>
}

async function loadFeed(signal: AbortSignal): Promise<GithubFeed> {
  const user = profile.githubUser
  const [userInfo, repoList] = await Promise.all([
    getJson<{ public_repos: number; created_at: string }>(`${API}/users/${user}`, signal),
    getJson<ApiRepo[]>(`${API}/users/${user}/repos?sort=pushed&per_page=12`, signal),
  ])
  // Skip forks and empty repositories (no commits to show)
  const repos = repoList.filter((r) => !r.fork && r.size > 0)

  const commitLists = await Promise.all(
    repos.slice(0, 3).map((r) =>
      getJson<ApiCommit[]>(`${API}/repos/${user}/${r.name}/commits?per_page=5`, signal)
        .then((list) =>
          list.map<FeedCommit>((c) => ({
            sha: c.sha.slice(0, 7),
            repo: r.name,
            message: c.commit.message.split('\n')[0],
            date: c.commit.author?.date ?? r.pushed_at,
            url: c.html_url,
          })),
        )
        .catch(() => [] as FeedCommit[]),
    ),
  )

  return {
    repos: repos.slice(0, 6).map((r) => ({
      name: r.name,
      url: r.html_url,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      pushedAt: r.pushed_at,
    })),
    commits: commitLists
      .flat()
      .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
      .slice(0, 7),
    publicRepos: userInfo.public_repos,
    since: userInfo.created_at.slice(0, 4),
    fetchedAt: Date.now(),
  }
}

function readCache(): GithubFeed | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const feed = JSON.parse(raw) as GithubFeed
    return Date.now() - feed.fetchedAt < TTL ? feed : null
  } catch {
    return null
  }
}

export type FeedState = { status: 'loading' } | { status: 'ready'; feed: GithubFeed } | { status: 'error' }

/** Fetches the feed once the component is near the viewport (`enabled`). */
export function useGithubFeed(enabled: boolean): FeedState {
  const [state, setState] = useState<FeedState>(() => {
    const cached = typeof window !== 'undefined' ? readCache() : null
    return cached ? { status: 'ready', feed: cached } : { status: 'loading' }
  })

  useEffect(() => {
    if (!enabled || state.status === 'ready') return
    const ctrl = new AbortController()
    loadFeed(ctrl.signal)
      .then((feed) => {
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(feed))
        } catch {
          /* storage unavailable — still show the feed */
        }
        setState({ status: 'ready', feed })
      })
      .catch((e: unknown) => {
        if ((e as Error).name !== 'AbortError') setState({ status: 'error' })
      })
    return () => ctrl.abort()
  }, [enabled, state.status])

  return state
}

/** "3h ago", "2d ago", "5mo ago" */
export function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - Date.parse(iso)) / 1000)
  const units: [number, string][] = [
    [60 * 60 * 24 * 365, 'y'],
    [60 * 60 * 24 * 30, 'mo'],
    [60 * 60 * 24 * 7, 'w'],
    [60 * 60 * 24, 'd'],
    [60 * 60, 'h'],
    [60, 'm'],
  ]
  for (const [secs, label] of units) if (s >= secs) return `${Math.floor(s / secs)}${label} ago`
  return 'just now'
}
