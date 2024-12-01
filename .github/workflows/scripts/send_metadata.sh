#!/usr/bin/env bash
set -e

# Validate commit history
if [[ "$COMMIT_HISTORY" == "Unable to fetch commit history." || -z "$COMMIT_HISTORY" ]]; then
  echo "Error: Commit history is invalid or empty. Aborting."
  exit 1
fi

# Validate PR number explicitly
if [[ -z "$PR_NUMBER" || "$PR_NUMBER" == "null" ]]; then
  echo "Error: PR_NUMBER is missing or invalid"
  exit 1
fi

echo "Sending metadata to server..."

IFS=$'\n'
commit_list=()
for commit in ${COMMIT_HISTORY}; do
  IFS='|' read -r sha message author_email author_name committer_email committer_name date <<<"$commit"

  # Escape commit message
  message=$(echo "$message" | jq -Rs .)

  # Fetch commit stats (fallback to 0 if stats cannot be retrieved)
  stats=$(git show --stat --format='' "$sha" | tail -n1 || echo "")
  files_changed=$(echo "$stats" | grep -oE '[0-9]+ file' | cut -d' ' -f1 || echo "0")
  insertions=$(echo "$stats" | grep -oE '[0-9]+ insertion' | cut -d' ' -f1 || echo "0")
  deletions=$(echo "$stats" | grep -oE '[0-9]+ deletion' | cut -d' ' -f1 || echo "0")

  commit_list+=("{
    \"sha\":\"$sha\",
    \"message\":$message,
    \"author_email\":\"$author_email\",
    \"author_name\":\"$author_name\",
    \"committer_email\":\"$committer_email\",
    \"committer_name\":\"$committer_name\",
    \"date\":\"$date\",
    \"stats\": {
      \"additions\": ${insertions:-0},
      \"deletions\": ${deletions:-0},
      \"changed_files\": ${files_changed:-0}
    }
  }")
done

# Build JSON array for commits
commit_json=$(printf "%s," "${commit_list[@]}")
commit_json="[${commit_json%,}]"

# Generate metadata
metadata=$(jq -n \
  --arg pr_number "$PR_NUMBER" \
  --arg pr_title "$PR_TITLE" \
  --arg pr_author "$PR_AUTHOR" \
  --arg pr_url "$PR_URL" \
  --arg base_branch "$BASE_BRANCH" \
  --arg head_branch "$HEAD_BRANCH" \
  --arg description "${PR_DESCRIPTION:-null}" \
  --arg author_username "$PR_AUTHOR_USERNAME" \
  --arg author_avatar "$PR_AUTHOR_AVATAR" \
  --arg base_repository "$PR_BASE_REPO" \
  --arg head_repository "$PR_HEAD_REPO" \
  --arg draft "$PR_DRAFT" \
  --arg labels "${PR_LABELS:-}" \
  --arg reviewers "${PR_REVIEWERS:-}" \
  --arg created_at "$PR_CREATED_AT" \
  --arg updated_at "$PR_UPDATED_AT" \
  --arg closed_at "${PR_CLOSED_AT:-null}" \
  --arg merged_at "${PR_MERGED_AT:-null}" \
  --argjson mergeable "${PR_MERGEABLE:-null}" \
  --argjson stats "{
    \"comments\": ${PR_COMMENTS:-0},
    \"additions\": ${PR_ADDITIONS:-0},
    \"deletions\": ${PR_DELETIONS:-0},
    \"changedFiles\": ${PR_CHANGED_FILES:-0}
  }" \
  --argjson commits "$commit_json" \
  '{
    prNumber: $pr_number,
    prTitle: $pr_title,
    prAuthor: $pr_author,
    description: ($description | select(. != null)),
    authorUsername: $author_username,
    authorAvatar: $author_avatar,
    prUrl: $pr_url,
    baseBranch: $base_branch,
    headBranch: $head_branch,
    baseRepository: $base_repository,
    headRepository: $head_repository,
    isDraft: ($draft == "true"),
    labels: ($labels | select(. != null and . != "") | split(",") | map(. | gsub("^[ \t]+|[ \t]+$"; "")) | map(select(. != ""))),  # White spaces Trimming
    reviewers: ($reviewers | split(",") | map(select(. != ""))),
    stats: $stats,
    mergeable: $mergeable,
    createdAt: $created_at,
    updatedAt: $updated_at,
    closedAt: ($closed_at | select(. != null)),
    mergedAt: ($merged_at | select(. != null)),
    commits: $commits
  }')

echo "Metadata: $metadata"
echo "PR_NUMBER: $PR_NUMBER"

# Send metadata to the server
curl -v -X POST "$BASE_APP_URL/github/store-data" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "$metadata" \
  -d '{"prNumber": '"$PR_NUMBER"'}' \
  --connect-timeout 10 \
  --max-time 30 -v
  