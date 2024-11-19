- name: Checkout code
  uses: actions/checkout@v3
  with:
    fetch-depth: 0
    ref: ${{ github.event.pull_request.head.sha }}

- name: Get Changed Files
  id: changed_files
  run: |
    CHANGED_FILES=$(git diff --name-only "${{ github.event.pull_request.base.sha }}" "${{ github.event.pull_request.head.sha }}")
    FILTERED_FILES=$(echo "$CHANGED_FILES" | grep -E '\.(js|ts|yml|md)$' || true)
    ESCAPED_FILES=$(echo "$FILTERED_FILES" | jq -sR .)
    echo "files=$ESCAPED_FILES" >> $GITHUB_OUTPUT

- name: Analyze Changed Files
  env:
    BASE_APP_URL: ${{ secrets.BASE_APP_URL }}
    API_KEY: ${{ secrets.API_KEY }}
    CHANGED_FILES: ${{ steps.changed_files.outputs.files }}
  run: |
    git config --global --add safe.directory "$GITHUB_WORKSPACE"
    bash .github/workflows/scripts/analyze_files.sh