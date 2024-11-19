#!/usr/bin/env bash

echo "Analyzing incremental changes..."

# Fetch base branch and last analyzed SHA
git fetch origin "${GITHUB_BASE_REF}"

# List files changed since the last analyzed SHA
changed_files=$(git diff --name-only "${LAST_ANALYZED_SHA}" "${GITHUB_HEAD_REF}")

analysis_results=""

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

# Save results for use in the comment script
echo "ANALYSIS_RESULTS<<EOF" >> $GITHUB_ENV
echo -e "$analysis_results" >> $GITHUB_ENV
echo "EOF" >> $GITHUB_ENV
