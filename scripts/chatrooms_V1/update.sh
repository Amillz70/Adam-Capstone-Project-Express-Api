#!/bin/bash

API="http://localhost:4741"
URL_PATH="/chatrooms"

curl "${API}${URL_PATH}/${ID}" \
  --include \
  --request PATCH \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer ${TOKEN}" \
  --data '{
    "chatroom": {
     "title": "'"${TITLE}"'",
     "maxNumber": "'"${MAXNUM}"'"
   }
 }'

echo
