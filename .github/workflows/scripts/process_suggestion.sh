# scripts/process_suggestion.sh
#!/bin/bash
set -e

if [[ "$COMMENT" == */accept-suggestion* ]]; then
  # Extract suggestion ID
  suggestion_id=$(echo "$COMMENT" | grep -oP '/accept-suggestion \K[a-f0-9-]+')
  
  if [ -f ".analysis-tmp/$suggestion_id.patch" ]; then
    # Apply the patch
    git apply ".analysis-tmp/$suggestion_id.patch"
    
    # Create commit
    git add .
    git commit -m "Apply AI suggestion: $suggestion_id"
    git push
    
    # Add comment
    gh pr comment "$PR_NUMBER" --body "✅ Applied suggestion $suggestion_id"
  fi
elif [[ "$COMMENT" == */reject-suggestion* ]]; then
  suggestion_id=$(echo "$COMMENT" | grep -oP '/reject-suggestion \K[a-f0-9-]+')
  gh pr comment "$PR_NUMBER" --body "❌ Rejected suggestion $suggestion_id"
fi