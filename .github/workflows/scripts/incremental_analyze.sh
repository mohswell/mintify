#!/usr/bin/env bash

echo "Analyzing incremental changes..."

# Fetch base branch and last analyzed SHA
git fetch origin "${GITHUB_BASE_REF}"

# Initialize analysis results
analysis_results=""

# List files changed since the last analyzed SHA
changed_files=$(git diff --name-only "${LAST_ANALYZED_SHA}" "${GITHUB_HEAD_REF}")

# Loop through each changed file
for file in $changed_files; do
  if [[ "$file" == *.js || "$file" == *.ts || "$file" == *.yml || "$file" == *.md ]]; then
    echo "Analyzing file: $file"

    # Capture diff output for the file
    diff_output=$(git diff "${LAST_ANALYZED_SHA}" "${GITHUB_HEAD_REF}" -- "$file")

    if [ -n "$diff_output" ]; then
      markdown_diff="### File: \`$file\`\n\n\`\`\`diff\n${diff_output}\n\`\`\`"
      escaped_diff=$(echo "$markdown_diff" | jq -sR .)

      # Send diff to API for analysis
      echo "Sending request to ${BASE_APP_URL}/gemini/analyze-code"
      result=$(curl -s -X POST "${BASE_APP_URL}/gemini/analyze-code" \
        -H "Authorization: Bearer ${API_KEY}" \
        -H "Content-Type: application/json" \
        -d "{\"code\": ${escaped_diff}}" || echo "Failed to get response")

      echo "API Response: $result"

      if [ -n "$result" ]; then
        # Extract the text field from the JSON response
        analysis_text=$(echo "$result" | jq -r '.text // empty')
        if [ -n "$analysis_text" ]; then
          analysis_results="${analysis_results}\n## Analysis for \`$file\`\n${analysis_text}"
        fi
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
  
  # Post initial analysis comment
  pr_number="${PR_NUMBER:-${github_event_pull_request_number}}"
  if [ -n "$pr_number" ]; then
    echo "Posting initial analysis comment..."
    gh pr comment "$pr_number" --body "$analysis_results"
  fi
fi