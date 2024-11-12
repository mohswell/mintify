# scripts/update_status.sh
#!/bin/bash
set -e

# Update PR status
gh pr status update \
  --repo "$REPO" \
  --pr "$PR_NUMBER" \
  --status "AI review completed" \
  --color green

# Add review summary to PR timeline
gh pr comment "$PR_NUMBER" --body "$(cat .analysis-tmp/analysis.json | jq -r '.summary')"
