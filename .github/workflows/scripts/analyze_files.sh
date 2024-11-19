#!/usr/bin/env bash

set -e

echo "Analyzing changed files..."

# Use GitHub-provided refs instead of relying on local branch names
base_sha="${GITHUB_BASE_REF:-${{ github.event.pull_request.base.sha }}}"
head_sha="${GITHUB_HEAD_REF:-${{ github.event.pull_request.head.sha }}}"

# Ensure base and head SHAs are valid
if [ -z "$base_sha" ] || [ -z "$head_sha" ]; then
  echo "Error: Base or Head SHA is missing"
  exit 1
fi

# Fetch the specific SHAs to ensure they exist
git fetch origin "$base_sha" "$head_sha"

# Ensure CHANGED_FILES is properly handled
if [ -z "$CHANGED_FILES" ]; then
  echo "No changed files detected"
  exit 0
fi

# Parse files, handling both JSON array and string input
parsed_files=$(echo "$CHANGED_FILES" | jq -r 'if type=="array" then .[] else . end' 2>/dev/null || echo "$CHANGED_FILES")

analysis_results=""

# Loop through each changed file
while IFS= read -r file; do
  if [[ "$file" =~ \.(js|ts|yml|md)$ ]]; then
    echo "Analyzing file: $file"

    # Use the specific SHAs for diff
    diff_output=$(git diff "$base_sha" "$head_sha" -- "$file")

    if [ -n "$diff_output" ]; then
      # Escape markdown diff
      markdown_diff="### File: \`$file\`\n\n\`\`\`diff\n${diff_output}\n\`\`\`"
      escaped_diff=$(echo "$markdown_diff" | jq -sR .)

      # Send diff to API
      result=$(curl -s -X POST "${BASE_APP_URL}/gemini/analyze-code" \
        -H "Authorization: Bearer ${API_KEY}" \
        -H "Content-Type: application/json" \
        -d "{\"code\": ${escaped_diff}}")

      if [ -n "$result" ]; then
        analysis_results="${analysis_results}\n## Analysis for \`$file\`\n${result}"
      fi
    fi
  fi
done <<< "$parsed_files"

# Save results for comment script
if [ -n "$analysis_results" ]; then
  echo "ANALYSIS_RESULTS<<EOF" >> "$GITHUB_ENV"
  echo -e "$analysis_results" >> "$GITHUB_ENV"
  echo "EOF" >> "$GITHUB_ENV"
fi