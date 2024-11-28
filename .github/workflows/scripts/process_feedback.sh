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

  echo "Sending file content for testing: $file" 

  # Format the content as markdown for the test formatter
  local markdown_content="### File: \`$file\`\n\n\`\`\`typescript\n${file_content}\n\`\`\`"
  local escaped_markdown=$(echo "$markdown_content" | jq -sR .)
  
  # Send request to test generation service
  local response=$(curl -s -X POST "${BASE_APP_URL}/gemini/generate-tests" \
    -H "Authorization: Bearer ${API_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"code\": ${escaped_markdown}}")

  echo "Received response: $response" # Debug log
  
  # Extract the test code from the response
  # Assumes the response follows the format from `TestFormatterService`
  local test_code=$(echo "$response" | grep -oP '(?<=```(?:typescript|js|javascript)?\n)[\s\S]*?(?=\n```)')
  
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
    # Add debugging logs here at the start of the case
    echo "=== DEBUG INFORMATION ==="
    echo "BASE_APP_URL: ${BASE_APP_URL}"
    echo "API_KEY is set: $([ ! -z "${API_KEY}" ] && echo 'yes' || echo 'no')"
    echo "Current directory: $(pwd)"
    echo "Contents of .analysis-data:"
    ls -la .analysis-data || echo "Directory not found"
    echo "=== END DEBUG INFO ==="
    
    echo "Generating tests..."
    test_results=""
    
    # Read the analyzed files from the saved list
    if [ -f ".analysis-data/analyzed_files" ]; then
        echo "=== ANALYZED FILES CONTENT ==="
        cat ".analysis-data/analyzed_files"
        echo "=== END ANALYZED FILES ==="
        
        while IFS= read -r file; do
            echo "Processing file: $file"
            if [[ "$file" =~ \.(ts|js|tsx|jsx)$ ]]; then
                echo "Generating tests for $file"
                
                # Read the file content
                if [ -f "$file" ]; then
                    echo "File exists, reading content..."
                    file_content=$(cat "$file")
                    
                    # Format the content as markdown
                    echo "Formatting content as markdown..."
                    markdown_content="### File: \`$file\`\n\n\`\`\`typescript\n${file_content}\n\`\`\`"
                    escaped_markdown=$(echo "$markdown_content" | jq -sR .)
                    
                    # Send request to test generation service
                    echo "Sending request to test generation service..."
                    echo "Request URL: ${BASE_APP_URL}/gemini/generate-tests"
                    test_response=$(curl -v -X POST "${BASE_APP_URL}/gemini/generate-tests" \
                        -H "Authorization: Bearer ${API_KEY}" \
                        -H "Content-Type: application/json" \
                        -d "{\"code\": ${escaped_markdown}}" 2>&1)
                    
                    echo "Raw API Response:"
                    echo "$test_response"
                    
                    if [ -n "$test_response" ]; then
                        echo "Received non-empty response"
                        # Extract the text field from the JSON response
                        test_code=$(echo "$test_response" | jq -r '.text // .')
                        
                        test_results="${test_results}
## Tests for \`$file\`

${test_code}

---
"
                    else
                        echo "Received empty response from API"
                    fi
                else
                    echo "File not found: $file"
                fi
            else
                echo "File $file is not a TypeScript/JavaScript file, skipping"
            fi
        done < ".analysis-data/analyzed_files"
    else
        echo "No analyzed files found at .analysis-data/analyzed_files"
    fi
    
    echo "=== FINAL TEST RESULTS ==="
    echo "$test_results"
    echo "=== END TEST RESULTS ==="
    
    if [ -n "$test_results" ]; then
        echo "Posting comment with test results..."
        post_comment "### 🧪 Generated Tests

${test_results}

*Review the generated tests and add them to your test suite if they look good.*"
    else
        echo "No test results generated, posting warning..."
        post_comment "### ⚠️ No Tests Generated
No eligible files found for test generation or test generation failed."
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