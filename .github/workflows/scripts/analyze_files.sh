#!/usr/bin/env bash

set -e

echo "Analyzing changed files..."

# More robust file parsing
if [ -z "$CHANGED_FILES" ]; then
  echo "No changed files detected"
  exit 0
fi

# Use jq to safely parse files
parsed_files=$(echo "$CHANGED_FILES" | jq -r 'if type=="array" then .[] else . end' 2>/dev/null)

analysis_results=""

# Improved file loop
while IFS= read -r file; do
  if [[ "$file" =~ \.(js|ts|yml|md)$ ]]; then
    echo "Analyzing file: $file"

    # Capture diff output
    diff_output=$(git diff --unified=0 origin/"${GITHUB_BASE_REF}" "${GITHUB_HEAD_REF}" -- "$file")

    if [ -n "$diff_output" ]; then
      # Escape diff for JSON
      escaped_diff=$(echo "$diff_output" | jq -sR .)

      # Send diff to API with error handling
      result=$(curl -s -X POST "${BASE_APP_URL}/gemini/analyze-code" \
        -H "Authorization: Bearer ${API_KEY}" \
        -H "Content-Type: application/json" \
        -d "{\"code\": ${escaped_diff}}" || echo '')

      # Check if result is not empty
      if [ -n "$result" ]; then
        # Escape result for environment variable
        escaped_result=$(echo "$result" | jq -sR .)
        analysis_results="${analysis_results}\n## Analysis for \`$file\`\n${escaped_result}"
      fi
    fi
  fi
done <<< "$parsed_files"

# Save results for comment script
if [ -n "$analysis_results" ]; then
  echo "ANALYSIS_RESULTS<<EOF" >> "$GITHUB_ENV"
  echo -e "$analysis_results" | jq -sR . >> "$GITHUB_ENV"
  echo "EOF" >> "$GITHUB_ENV"
fi