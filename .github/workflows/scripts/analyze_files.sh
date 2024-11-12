# scripts/analyze_files.sh
#!/bin/bash

echo "Analyzing changed files..."
git fetch origin ${{ github.event.pull_request.base.ref }}
analysis_results=""

changed_files=$(git diff --name-only origin/${{ github.event.pull_request.base.ref }} ${{ github.event.pull_request.head.sha }})

for file in $changed_files; do
  if [[ "$file" == *.js || "$file" == *.ts || "$file" == *.yml || "$file" == *.md ]]; then
    echo "Analyzing file: $file"
    diff_output=$(git diff origin/${{ github.event.pull_request.base.ref }} ${{ github.event.pull_request.head.sha }} -- "$file")

    if [ -n "$diff_output" ]; then
      markdown_diff="### File: \`$file\`\n\n\`\`\`diff\n${diff_output}\n\`\`\`"
      escaped_diff=$(echo "$markdown_diff" | jq -sR .)

      result=$(curl -s -X POST "${{ env.BASE_APP_URL }}/gemini/analyze-code" \
        -H "Authorization: Bearer ${{ env.API_KEY }}" \
        -H "Content-Type: application/json" \
        -d "{\"code\": ${escaped_diff}}")

      if [ -n "$result" ]; then
        analysis_results="${analysis_results}\n\n## Analysis for \`$file\`\n${result}"
      fi
    fi
  fi
done

if [ -n "$analysis_results" ]; then
  echo "ANALYSIS_RESULTS<<EOF" >> $GITHUB_ENV
  echo -e "$analysis_results" >> $GITHUB_ENV
  echo "EOF" >> $GITHUB_ENV
else
  echo "ANALYSIS_RESULTS=No changes requiring analysis were found." >> $GITHUB_ENV
fi
