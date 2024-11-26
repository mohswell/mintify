#!/usr/bin/env bash
set -e

echo "Processing feedback..."

# Function to post comment using GitHub API
post_comment() {
  local body="$1"
  curl -X POST \
    -H "Authorization: Bearer ${GITHUB_TOKEN}" \
    -H "Accept: application/vnd.github.v3+json" \
    -d "{\"body\": $(echo "$body" | jq -sR)}" \
    "https://api.github.com/repos/${REPO}/issues/${PR_NUMBER}/comments"
}

# Function to generate tests for a file
generate_tests() {
  local file="$1"
  local file_content=$(cat "$file")
  local escaped_content=$(echo "$file_content" | jq -sR .)
  
  # Send request to test generation service
  local response=$(curl -s -X POST "${BASE_APP_URL}/gemini/generate-tests" \
    -H "Authorization: Bearer ${API_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"code\": ${escaped_content}}")
  
  # Extract the test code from the response
  # Assumes the response follows the format from TestFormatterService
  local test_code=$(echo "$response" | grep -oP '(?<=```typescript\n)[\s\S]*?(?=\n```)')
  
  # If no test code found, use the entire response
  if [ -z "$test_code" ]; then
    test_code="$response"
  fi
  
  echo "$test_code"
}

# Process different comment triggers
case "$COMMENT_BODY" in
  "/approve")
    echo "Feedback: Approved"
    
    # Configure git
    git config --global user.name "github-actions[bot]"
    git config --global user.email "github-actions[bot]@users.noreply.github.com"
    
    # Apply suggested changes
    if [ -n "$ANALYSIS_RESULTS" ]; then
      echo "$ANALYSIS_RESULTS" | while IFS= read -r line; do
        if [[ $line == *"replace"* ]]; then
          file_path=$(echo "$line" | grep -oP '(?<=File: `)[^`]+')
          suggestion=$(echo "$line" | grep -oP '(?<=\`\`\`diff\n)[\s\S]+(?=\n\`\`\`)')
          echo "$suggestion" | patch "$file_path"
        fi
      done
      
      # Commit and push changes
      git add .
      git commit -m "Apply AI code suggestions"
      git push origin HEAD
    fi
    
    post_comment "### ✅ Changes Approved
    
Would you like to generate tests for the changed files?
- Reply \`/generate-tests\` to generate test cases
- Reply \`/skip-tests\` to skip test generation"
    ;;
    
  "/reject")
    post_comment "### ❌ Changes Rejected
    
No changes have been applied. Please review the feedback and make necessary adjustments."
    ;;
    
  "/generate-tests")
    echo "Generating tests..."
    test_results=""
    
    # Get changed files
    changed_files=$(git diff --name-only HEAD~1)
    
    for file in $changed_files; do
      if [[ "$file" =~ \.(js|ts)$ ]]; then
        echo "Generating tests for $file"
        test_response=$(generate_tests "$file")
        
        if [ -n "$test_response" ]; then
          test_results="${test_results}
## Tests for \`$file\`
\`\`\`typescript
${test_response}
\`\`\`
"
        fi
      fi
    done
    
    if [ -n "$test_results" ]; then
      post_comment "### 🧪 Generated Tests
${test_results}

*Review the generated tests and add them to your test suite if they look good.*"
    else
      post_comment "### ⚠️ No Tests Generated
No eligible files found for test generation."
    fi
    ;;
    
  "/skip-tests")
    post_comment "### ⏭️ Test Generation Skipped
Proceeding without generating tests."
    ;;
    
  *)
    echo "Unknown command: $COMMENT_BODY"
    ;;
esac