#!/bin/bash

analyze_code() {
  local file="$1"
  local content=$(<"$file")

  # Send the content to the API and capture the response
  response=$(curl -X POST "$BASE_APP_URL/gemini/analyze-code" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$(jq -n --arg code "$content" '{code: $code}')")

  echo "$response"
}

# Call the analyze_code function and capture the response
analysis_result=$(analyze_code "$1")

# Output the result (you can format it or pass it as needed)
echo "$analysis_result"
