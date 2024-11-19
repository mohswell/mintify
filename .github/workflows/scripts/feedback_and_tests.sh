#!/usr/bin/env bash

set -e

echo "Processing user feedback..."

# Install GitHub CLI if not already installed
if ! command -v gh &> /dev/null; then
  (type -p wget >/dev/null || (sudo apt update && sudo apt-get install wget -y)) \
  && sudo mkdir -p -m 755 /etc/apt/keyrings \
  && wget -qO- https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
  && sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
  && sudo apt update \
  && sudo apt install gh -y
fi

post_comment() {
  local body="$1"
  local pr_number="${PR_NUMBER}"
  
  if [ -n "$pr_number" ]; then
    echo "Posting comment to PR #${pr_number}..."
    gh pr comment "$pr_number" --body "$body"
  else
    echo "Error: No PR number found"
    return 1
  fi
}

echo "Comment body: $COMMENT_BODY"

case "$COMMENT_BODY" in
  "/approve")
    echo "Feedback: Approved"
    post_comment "### ✅ Feedback Approved

Your suggestions have been approved. Do you want to generate tests?

- Reply \`/generate-tests\` to generate tests
- Reply \`/skip-tests\` to skip test generation"
    ;;

  "/reject")
    echo "Feedback: Rejected"
    post_comment "### ❌ Feedback Rejected

Changes have not been applied. Please review the feedback and make necessary adjustments."
    ;;

  "/generate-tests")
    echo "Generating tests for the changes..."
    
    # Get files changed in the PR
    files_to_test=$(git diff --name-only "$HEAD_SHA")
    test_generation_results=""
    
    for file in $files_to_test; do
      if [[ "$file" =~ \.(js|ts)$ ]]; then
        echo "Generating tests for $file"
        file_content=$(cat "$file")
        escaped_content=$(echo "$file_content" | jq -sR .)
        
        response=$(curl -s -X POST "${BASE_APP_URL}/gemini/generate-tests" \
          -H "Authorization: Bearer ${API_KEY}" \
          -H "Content-Type: application/json" \
          -d "{\"code\": ${escaped_content}}")
        
        if [ -n "$response" ]; then
          test_text=$(echo "$response" | jq -r '.text // empty')
          if [ -n "$test_text" ]; then
            test_generation_results="${test_generation_results}\n## Generated Tests for \`$file\`\n\`\`\`javascript\n${test_text}\n\`\`\`"
          fi
        fi
      fi
    done
    
    if [ -n "$test_generation_results" ]; then
      post_comment "### 🧪 Generated Tests\n${test_generation_results}"
    else
      post_comment "### ⚠️ Test Generation Failed

No tests could be generated. Please check the logs for details."
    fi
    ;;

  "/skip-tests")
    echo "User opted to skip test generation."
    post_comment "### Test Generation Skipped ⏭️

No tests were generated as per your request."
    ;;

  *)
    echo "Unknown command: $COMMENT_BODY"
    ;;
esac