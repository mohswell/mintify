# setup_env.sh
#!/bin/bash
set -e

echo "Setting up environment variables..."
echo "BASE_APP_URL=$BASE_APP_URL" >> $GITHUB_ENV
echo "API_KEY=$API_KEY" >> $GITHUB_ENV

# analyze_code.sh
#!/bin/bash
set -e

echo "Analyzing code changes..."

# Fetch base branch
git fetch origin ${{ github.event.pull_request.base.ref }}

# Initialize suggestions array
suggestions=()
analysis_results=""

# Get changed files
changed_files=$(git diff --name-only origin/${{ github.event.pull_request.base.ref }} ${{ github.event.pull_request.head.sha }})

for file in $changed_files; do
  if [[ "$file" == *.js || "$file" == *.ts || "$file" == *.yml || "$file" == *.md ]]; then
    echo "Analyzing file: $file"
    
    # Get file diff with line numbers
    diff_output=$(git diff --unified=0 origin/${{ github.event.pull_request.base.ref }} ${{ github.event.pull_request.head.sha }} -- "$file")
    
    if [ -n "$diff_output" ]; then
      # Format the diff as markdown with line numbers
      markdown_diff="### File: \`$file\`\n\n\`\`\`diff\n${diff_output}\n\`\`\`"
      
      # Send to API
      result=$(curl -s -X POST "${{ env.BASE_APP_URL }}/gemini/analyze-code" \
        -H "Authorization: Bearer ${{ env.API_KEY }}" \
        -H "Content-Type: application/json" \
        -d "{\"code\": $(echo "$markdown_diff" | jq -sR .)}")
      
      # Parse suggestions and store them
      if [ -n "$result" ]; then
        suggestions+=("{\"file\":\"$file\",\"changes\":$result}")
        analysis_results="${analysis_results}\n## Analysis for \`$file\`\n${result}\n---"
      fi
    fi
  fi
done

# Set outputs
echo "suggestions=$(echo "${suggestions[@]}" | jq -sR .)" >> $GITHUB_OUTPUT
echo "ANALYSIS_RESULTS<<EOF" >> $GITHUB_ENV
echo -e "$analysis_results" >> $GITHUB_ENV
echo "EOF" >> $GITHUB_ENV

# create_review_dashboard.sh
#!/bin/bash
set -e

# Create detailed check run output
github_token="${{ secrets.GITHUB_TOKEN }}"
check_run_id=$CHECK_RUN_ID
suggestions=$SUGGESTIONS

# Parse suggestions
parsed_suggestions=$(echo "$suggestions" | jq -r '.')

# Create HTML report
html_report=$(cat << EOF
<details>
<summary>🤖 AI Code Review Results</summary>

### Suggested Changes

$(echo "$parsed_suggestions" | jq -r '.[] | "
#### \(.file)
\(.changes)
"')

### Actions
- To apply all suggestions: \`/ai-review apply-all\`
- To apply specific suggestion: \`/ai-review apply #<number>\`
- To reject all: \`/ai-review reject-all\`
- To reject specific: \`/ai-review reject #<number>\`

</details>
EOF
)

# Update check run with results
curl -X PATCH \
  -H "Authorization: Bearer $github_token" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$GITHUB_REPOSITORY/check-runs/$check_run_id" \
  -d "{
    \"status\": \"completed\",
    \"conclusion\": \"neutral\",
    \"output\": {
      \"title\": \"AI Code Review Results\",
      \"summary\": \"AI has analyzed your code changes and provided suggestions.\",
      \"text\": $(echo "$html_report" | jq -sR .)
    }
  }"

# process_review_command.sh
#!/bin/bash
set -e

comment="$COMMENT"
command=$(echo "$comment" | grep -oP '/ai-review \K.*')

case $command in
  "apply-all")
    # Apply all suggestions
    echo "Applying all suggestions..."
    ;;
  "apply #"*)
    # Apply specific suggestion
    suggestion_number=$(echo "$command" | grep -oP '#\K\d+')
    echo "Applying suggestion #$suggestion_number..."
    ;;
  "reject-all")
    # Reject all suggestions
    echo "Rejecting all suggestions..."
    ;;
  "reject #"*)
    # Reject specific suggestion
    suggestion_number=$(echo "$command" | grep -oP '#\K\d+')
    echo "Rejecting suggestion #$suggestion_number..."
    ;;
esac