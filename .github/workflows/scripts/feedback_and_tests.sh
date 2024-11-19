#!/usr/bin/env bash

echo "Processing user feedback..."

post_comment() {
  local body="$1"
  local pr_number="${PR_NUMBER:-${github_event_issue_number}}"
  
  if [ -n "$pr_number" ]; then
    echo "Posting comment to PR #${pr_number}..."
    gh pr comment "$pr_number" --body "$body"
  else
    echo "Error: No PR number found"
    return 1
  fi
}

echo "Comment body: $COMMENT_BODY"

if [[ "$COMMENT_BODY" == "/approve" ]]; then
  echo "Feedback: Approved"
  post_comment "### ✅ Feedback Approved

Your suggestions have been approved. Do you want to generate tests for the applied changes?

- Reply \`/generate-tests\` to generate tests
- Reply \`/skip-tests\` to skip test generation"

elif [[ "$COMMENT_BODY" == "/reject" ]]; then
  echo "Feedback: Rejected"
  post_comment "### ❌ Feedback Rejected

Changes have not been applied. Please review the feedback and make necessary adjustments."

elif [[ "$COMMENT_BODY" == "/generate-tests" ]]; then
  echo "Generating tests for the changes..."
  
  # Get the current file content
  files_to_test=$(git diff --name-only "${GITHUB_HEAD_REF}")
  test_generation_results=""
  
  for file in $files_to_test; do
    if [[ "$file" == *.js || "$file" == *.ts ]]; then
      file_content=$(cat "$file")
      escaped_content=$(echo "$file_content" | jq -sR .)
      
      response=$(curl -s -X POST "${BASE_APP_URL}/gemini/generate-tests" \
        -H "Authorization: Bearer ${API_KEY}" \
        -H "Content-Type: application/json" \
        -d "{\"code\": ${escaped_content}}")
      
      if [ -n "$response" ]; then
        test_text=$(echo "$response" | jq -r '.text // empty')
        if [ -n "$test_text" ]; then
          test_generation_results="${test_generation_results}\n## Generated Tests for \`$file\`\n${test_text}"
        fi
      fi
    fi
  done
  
  if [ -n "$test_generation_results" ]; then
    post_comment "### 🧪 Generated Tests\n${test_generation_results}"
  else
    post_comment "### ⚠️ Test Generation Failed\n\nNo tests could be generated. Please check the logs for details."
  fi

elif [[ "$COMMENT_BODY" == "/skip-tests" ]]; then
  echo "User opted to skip test generation."
  post_comment "### Test Generation Skipped ⏭️\n\nNo tests were generated as per your request."
else
  echo "Unknown command: $COMMENT_BODY"
fi