#!/usr/bin/env bash
set -e

echo "Analyzing changed files..."

# Fetch base branch for diff comparison
git fetch origin "${GITHUB_BASE_REF}"

analysis_results=""

# Get the last analyzed commit
last_analyzed_commit=$(cat .analysis-data/last_analyzed_commit)

echo "Last analyzed commit: ${last_analyzed_commit}"
echo "Current HEAD: ${GITHUB_HEAD_SHA}"

# Get only new changes since last analysis
changed_files=$(git diff --name-only "${last_analyzed_commit}" "${GITHUB_HEAD_SHA}")

# If no files have changed since last analysis
if [ -z "$changed_files" ]; then
    echo "No new changes to analyze since last analysis"
    exit 0
fi

echo "Files changed since last analysis:"
echo "$changed_files"

# Track files that have been analyzed
analyzed_files=()

for file in $changed_files; do
    if [[ "$file" == *.js || "$file" == *.ts || "$file" == *.yml || "$file" == *.md || "$file" == *.py || "$file" == *.tsx || "$file" == *.java || "$file" == *.css || "$file" == *.sh ]]; then
        echo "Analyzing file: $file"
        
        # Get diff only for this specific file between last analysis and current commit
        diff_output=$(git diff "${last_analyzed_commit}" "${GITHUB_HEAD_SHA}" -- "$file")
        
        # Calculate additions and deletions
        additions=$(echo "$diff_output" | grep -c "^+")
        deletions=$(echo "$diff_output" | grep -c "^-")
        
        if [ -n "$diff_output" ]; then
            # Create a meaningful diff context
            markdown_diff="### File: \`$file\`\n\n\`\`\`diff\n${diff_output}\n\`\`\`"
            escaped_diff=$(echo "$markdown_diff" | jq -sR .)
            
            # Send file analysis to new endpoint
            file_analysis_result=$(curl -s -X POST "${BASE_APP_URL}/github/store-file-analysis" \
                -H "Authorization: Bearer ${API_KEY}" \
                -H "Content-Type: application/json" \
                -d "{
                    \"prNumber\": ${PR_NUMBER},
                    \"filePath\": \"${file}\",
                    \"additions\": ${additions},
                    \"deletions\": ${deletions},
                    \"rawDiff\": ${escaped_diff}
                }")
            
            # Send diff to AI analysis endpoint
            result=$(curl -s -X POST "${BASE_APP_URL}/gemini/analyze-code" \
                -H "Authorization: Bearer ${API_KEY}" \
                -H "Content-Type: application/json" \
                -d "{
                    \"code\": ${escaped_diff},
                    \"pr_number\": \"${PR_NUMBER}\",
                    \"file_path\": \"${file}\"
                }")
            
            if [ -n "$result" ]; then
                analysis_results="${analysis_results}\n## Analysis for \`$file\`\n${result}"
                analyzed_files+=("$file")
            fi
        fi
    fi
done

# Save current commit as last analyzed
echo "${GITHUB_HEAD_SHA}" > .analysis-data/last_analyzed_commit

# Save list of analyzed files
printf "%s\n" "${analyzed_files[@]}" > .analysis-data/analyzed_files

# Save results for use in the comment script
echo "ANALYSIS_RESULTS<<EOF" >> $GITHUB_ENV
echo -e "$analysis_results" >> $GITHUB_ENV
echo "EOF" >> $GITHUB_ENV