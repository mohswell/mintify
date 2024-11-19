#!/usr/bin/env bash

echo "Processing user feedback..."

post_comment() {
  local body="$1"
  gh api repos/${REPO}/issues/${PR_NUMBER}/comments \
    -f body="$body" \
    -H "Authorization: Bearer $GITHUB_TOKEN"
}

if [[ "$COMMENT_BODY" == "/approve" ]]; then
  echo "Feedback: Approved"
  post_comment "### Feedback Approved\n\nYour suggestions have been approved. Do you want to generate tests for the applied changes?\n\n- Click [Generate Tests](#) or reply `/generate-tests`.\n- Reply `/skip-tests` to skip."

elif [[ "$COMMENT_BODY" == "/reject" ]]; then
  echo "Feedback: Rejected"
  post_comment "### Feedback Rejected\n\nNo changes were applied."

elif [[ "$COMMENT_BODY" == "/generate-tests" ]]; then
  echo "Generating tests for the changes..."
  response=$(curl -s -X POST "${BASE_APP_URL}/generate-tests" \
    -H "Authorization: Bearer ${API_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"pr_number\": ${PR_NUMBER}, \"repo\": \"${REPO}\"}")

  if [[ $response == *"success"* ]]; then
    post_comment "### Test Generation Successful\n\nThe tests have been successfully generated. Please review the results."
  else
    post_comment "### Test Generation Failed\n\nThere was an error generating the tests. Please check the logs for details."
  fi

elif [[ "$COMMENT_BODY" == "/skip-tests" ]]; then
  echo "User opted to skip test generation."
  post_comment "### Test Generation Skipped\n\nNo tests were generated as per your request."
else
  echo "Unknown command. Ignoring."
fi
