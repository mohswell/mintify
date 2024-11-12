# scripts/analyze_code.sh
#!/bin/bash
set -e

echo "Starting code analysis..."

# Get changed files
git fetch origin $BASE_REF
changed_files=$(git diff --name-only origin/$BASE_REF $HEAD_SHA)

analysis_results=()
suggestions=()

for file in $changed_files; do
  if [[ "$file" =~ \.(js|ts|yml|md|sh)$ ]]; then
    echo "Analyzing file: $file"
    
    # Get file diff
    diff_output=$(git diff origin/$BASE_REF $HEAD_SHA -- "$file")
    
    # Format for API
    markdown_diff="### File: \`$file\`\n\n\`\`\`diff\n${diff_output}\n\`\`\`"
    echo "Markdown diff: $markdown_diff"
    escaped_diff=$(echo "$markdown_diff" | jq -sR .)
    echo "Diff: $escaped_diff"
    
    # Get AI analysis
    result=$(curl -s -X POST "$BASE_APP_URL/gemini/analyze-code" \
      -H "Authorization: Bearer $API_KEY" \
      -H "Content-Type: application/json" \
      -d "{\"code\": ${escaped_diff}}")
    
    # Parse suggestions
    if [ -n "$result" ]; then
      # Store result
      analysis_results+=("$result")

      echo "Analysis result: $result"
      
      # Extract actionable suggestions
      suggestion_id=$(uuidgen)
      patch_content=$(echo "$result" | jq -r '.suggestions[] | .patch // empty')
      
      if [ -n "$patch_content" ]; then
        echo "$patch_content" > ".analysis-tmp/$suggestion_id.patch"
        suggestions+=("{\"id\": \"$suggestion_id\", \"file\": \"$file\", \"description\": \"$(echo "$result" | jq -r '.suggestions[] | .description // empty')\"}")
      fi
    fi
  fi
done

# Create detailed analysis output
cat << EOF > .analysis-tmp/analysis.json
{
  "summary": "AI Code Review Summary",
  "details": "$(printf '%s\n\n' "${analysis_results[@]}")",
  "annotations": [
    $(for s in "${suggestions[@]}"; do echo "$s,"; done)
  ],
  "suggestions": [
    $(for s in "${suggestions[@]}"; do echo "$s,"; done)
  ]
}
EOF

# Set outputs
cat .analysis-tmp/analysis.json >> $GITHUB_ENV
echo "analysis_id=$(uuidgen)" >> $GITHUB_OUTPUT