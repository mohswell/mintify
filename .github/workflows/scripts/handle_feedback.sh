#!/bin/bash

# Check if the review was an approval or rejection
if [[ "${{ github.event.pull_request_review.state }}" == "approved" ]]; then
  echo "User approved changes. Committing suggestions..."

  # Apply changes and create a commit
  git config --global user.name "github-actions[bot]"
  git config --global user.email "github-actions[bot]@users.noreply.github.com"
  git add .
  git commit -m "Apply AI Code Suggestions"
  git push
elif [[ "${{ github.event.pull_request_review.state }}" == "changes_requested" ]]; then
  echo "User rejected changes. No action taken."
fi