#!/bin/bash

extract_jira_card() {
    if [[ $BRANCH_NAME =~ [A-Z]+-[0-9]+ ]]; then
        EXTRACTED_INFO=${BASH_REMATCH[0]}
        echo "Extracted id: $EXTRACTED_INFO"
        echo "JIRA_CARD=$EXTRACTED_INFO" >>$GITHUB_OUTPUT
    else
        echo "No matching pattern found."
        exit 1
    fi
}

extract_jira_card