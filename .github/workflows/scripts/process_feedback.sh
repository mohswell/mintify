#!/usr/bin/env bash

echo "Processing feedback..."

if [[ "$COMMENT_BODY" == "/approve" ]]; then
  echo "Feedback: Approved - Committing changes"

  # Apply AI-generated suggestions and commit
  git config --global user.name "github-actions[bot]"
  git config --global user.email "github-actions[bot]@users.noreply.github.com"
  git add .
  git commit -m "Apply AI code suggestions"
  git push origin "${GITHUB_HEAD_REF}"

elif [[ "$COMMENT_BODY" == "/reject" ]]; then
  echo "Feedback: Rejected - No changes applied"
fi
