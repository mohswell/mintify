#!/usr/bin/env bash

set -e

# Redirect all output to a log file for debugging
exec > >(tee incremental_analysis.log) 2> >(tee incremental_analysis_error.log >&2)

echo "Starting incremental analysis..."
echo "Environment variables:"
env | grep -E 'GITHUB|BASE_APP_URL|PR_NUMBER'

# Fetch base branch and last analyzed SHA
git fetch origin "${GITHUB_BASE_REF}"

# Initialize analysis results
analysis_results=""

# List files changed since the last analyzed SHA
echo "Finding changed files..."
changed_files=$(git diff --name-only "${LAST_ANALYZED_SHA}" "${GITHUB_HEAD_REF}")

echo "Changed files: $changed_files"

# Loop through each changed file
for file in $changed_files; do
  if [[ "$file" == *.js || "$file" == *.ts || "$file" == *.yml || "$file" == *.md ]]; then
    echo "Analyzing file: $file"

    # Capture diff output for the file
    diff_output=$(git diff "${LAST_ANALYZED_SHA}" "${GITHUB_HEAD_REF}" -- "$file")

    if [ -n "$diff_output" ]; then
      markdown_diff="### File: \`$file\`\n\n\`\`\`diff\n${diff_output}\n\`\`\`"
      escaped_diff=$(echo "$markdown_diff" | jq -sR .)

      echo "Sending request to ${BASE_APP_URL}/gemini/analyze-code"
      result=$(curl -s -X POST "${BASE_APP_URL}/gemini/analyze-code" \
        -H "Authorization: Bearer ${API_KEY}" \
        -H "Content-Type: application/json" \
        -d "{\"code\": ${escaped_diff}}")

      echo "API Response for $file: $result"

      # Always try to extract text, even if result is empty
      analysis_text=$(echo "$result" | jq -r '.text // "No analysis available"')
      
      if [ -n "$analysis_text" ]; then
        analysis_results="${analysis_results}\n## Analysis for \`$file\`\n${analysis_text}"
      fi
    fi
  fi
done

# Save results for use in the comment script
if [ -n "$analysis_results" ]; then
  echo "Saving analysis results..."
  {
    echo "ANALYSIS_RESULTS<<EOF"
    echo -e "$analysis_results"
    echo "EOF"
  } >> "$GITHUB_ENV"
  
  # Post analysis comment
  if [ -n "$PR_NUMBER" ]; then
    echo "Posting comment to PR #${PR_NUMBER}"
    gh pr comment "$PR_NUMBER" --body "$analysis_results"
  else
    echo "No PR number found. Cannot post comment."
  fi
else
  echo "No analysis results to save or post"
fi

echo "Incremental analysis complete."