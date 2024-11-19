#!/usr/bin/env bash

set -e

echo "Analyzing changed files..."

# Parse the JSON-escaped list of files
CHANGED_FILES=$(echo '${{ steps.changed_files.outputs.files }}' | jq -r '.[]')

# Initialize analysis results
ANALYSIS_RESULTS=""

# Loop through each changed file
while IFS= read -r file; do
    if [ -n "$file" ]; then
        echo "Analyzing file: $file"
        
        # Capture diff output
        diff_output=$(git diff ${{ github.event.pull_request.base.sha }} ${{ github.event.pull_request.head.sha }} -- "$file")
        
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
                ANALYSIS_RESULTS="${ANALYSIS_RESULTS}\n## Analysis for \`$file\`\n${result}"
            fi
        fi
    fi
done <<< "$CHANGED_FILES"

# Save results for comment script
if [ -n "$ANALYSIS_RESULTS" ]; then
    echo "ANALYSIS_RESULTS<<EOF" >> $GITHUB_ENV
    echo -e "$ANALYSIS_RESULTS" >> $GITHUB_ENV
    echo "EOF" >> $GITHUB_ENV
fi