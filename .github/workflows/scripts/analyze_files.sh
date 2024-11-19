#!/usr/bin/env bash

set -e

echo "Analyzing changed files..."

# Ensure CHANGED_FILES is properly handled
if [ -z "$CHANGED_FILES" ]; then
  echo "No changed files detected"
  exit 0
fi

# Attempt to parse JSON-escaped files list
parsed_files=$(echo "$CHANGED_FILES" | jq -r '.[]' 2>/dev/null || echo "$CHANGED_FILES")

analysis_results=""

# Loop through each changed file
for file in $parsed_files; do
  if [[ "$file" =~ \.(js|ts|yml|md)$ ]]; then
    echo "Analyzing file: $file"

    # Capture diff output
    diff_output=$(git diff origin/"${GITHUB_BASE_REF}" "${GITHUB_HEAD_REF}" -- "$file")

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
done

# Save results for comment script
if [ -n "$analysis_results" ]; then
  echo "ANALYSIS_RESULTS<<EOF" >> "$GITHUB_ENV"
  echo -e "$analysis_results" >> "$GITHUB_ENV"
  echo "EOF" >> "$GITHUB_ENV"
fi