post_comment() {
  local pr_id="$1"
  local comment="$2"

  curl -X POST "$BASE_APP_URL/gemini/comment-on-pr" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$(jq -n --arg pr_id "$pr_id" --arg comment "$comment" '{pr_id: $pr_id, comment: $comment}')"
}