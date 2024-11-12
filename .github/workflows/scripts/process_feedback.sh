#!/usr/bin/env bash

echo "Processing feedback..."

if [[ "$COMMENT_BODY" == "/approve" ]]; then
  echo "Feedback: Approved - Applying changes"

  # Fetch the PR and checkout branch
  git fetch origin "${GITHUB_HEAD_REF}"
  git checkout "${GITHUB_HEAD_REF}"

  # Parse `ANALYSIS_RESULTS` for suggested changes
  echo "$ANALYSIS_RESULTS" | while IFS= read -r line; do
    # Parse each line for suggestions (example format, adjust as needed)
    if [[ $line == *"replace"* ]]; then
      # Extract details for each code change
      file_path=$(echo "$line" | grep -oP '(?<=File: `)[^`]+')
      suggestion=$(echo "$line" | grep -oP '(?<=\`\`\`diff\n)[\s\S]+(?=\n\`\`\`)')

      # Apply change to the file using `sed` or `patch` if formatted as diff
      echo "$suggestion" | patch "$file_path"
    fi
  done

  # Commit and push changes
  git config --global user.name "github-actions[bot]"
  git config --global user.email "github-actions[bot]@users.noreply.github.com"
  git add .
  git commit -m "Apply AI code suggestions"
  git push origin "${GITHUB_HEAD_REF}"

elif [[ "$COMMENT_BODY" == "/reject" ]]; then
  echo "Feedback: Rejected - No changes applied"
fi
