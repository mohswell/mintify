#!/usr/bin/env bash

set -e

echo "Analyzing changed files..."

# Get last analyzed commit
last_analyzed_commit=$(cat .analysis-data/last_analyzed_commit)
current_commit=$(git rev-parse HEAD)

echo "Last analyzed commit: ${last_analyzed_commit}"
echo "Current commit: ${current_commit}"

# Determine changes
changed_files=$(git diff --name-only "${last_analyzed_commit}" "${current_commit}")

# If no files have changed
if [ -z "$changed_files" ]; then
  echo "No new changes to analyze"
  exit 0
fi

echo "Files changed:"
echo "$changed_files"

# Track analyzed files
analyzed_files=()

# Check previously analyzed files
if [ -f .analysis-data/analyzed_files ]; then
  mapfile -t previous_analyzed_files < .analysis-data/analyzed_files
else
  previous_analyzed_files=()
fi

# Supported file extensions for analysis
supported_extensions=("js" "ts" "yml" "md" "py" "dart" "tsx" "java" "css" "sh")

analysis_results=""

for file in $changed_files; do
  # Get file extension
  extension="${file##*.}"

  # Check if file is supported and not previously analyzed
  if [[ " ${supported_extensions[@]} " =~ " ${extension} " ]] && 
      [[ ! " ${previous_analyzed_files[@]} " =~ " ${file} " ]]; then
    
    echo "Analyzing file: $file"
    
    # Get diff for the file
    diff_output=$(git diff "${last_analyzed_commit}" "${current_commit}" -- "$file")
    
    # Calculate additions and deletions
    additions=$(echo "$diff_output" | grep "^+" | grep -v "^+++" | wc -l)
    deletions=$(echo "$diff_output" | grep "^-" | grep -v "^---" | wc -l)
    
    if [ -n "$diff_output" ]; then
      # Escape diff for JSON
      markdown_diff="### File: \`$file\`\n\n\`\`\`diff\n${diff_output}\n\`\`\`"
      escaped_diff=$(echo "$markdown_diff" | jq -sR .)
      
      # Send file analysis to server
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
      
      # Send diff to AI analysis
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
  else
    echo "Skipping file: $file (already analyzed or unsupported)"
  fi
done

# Update last analyzed commit
echo "${current_commit}" > .analysis-data/last_analyzed_commit

# Save unique analyzed files
unique_analyzed_files=($(printf "%s\n" "${previous_analyzed_files[@]}" "${analyzed_files[@]}" | sort -u))
printf "%s\n" "${unique_analyzed_files[@]}" > .analysis-data/analyzed_files

# Save results
echo "ANALYSIS_RESULTS<<EOF" >> $GITHUB_ENV
echo -e "$analysis_results" >> $GITHUB_ENV
echo "EOF" >> $GITHUB_ENV
env:
BASE_APP_URL: ${{ env.BASE_APP_URL }}
API_KEY: ${{ env.API_KEY }}
PR_NUMBER: ${{ github.event.pull_request.number }}