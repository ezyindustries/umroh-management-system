#!/bin/bash

echo "🔍 Testing Frontend Aplikasi Umroh..."
echo "=================================="

URL="https://dev-umroh-management.ezyindustries.my.id"

echo -e "\n1. Testing main page:"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$URL")
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d':' -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d')

echo "   HTTP Status: $HTTP_CODE"

if [[ "$BODY" == *"<!doctype html>"* ]]; then
    echo "   ✅ HTML doctype found"
else
    echo "   ❌ HTML doctype NOT found"
fi

if [[ "$BODY" == *"<div id=\"root\">"* ]]; then
    echo "   ✅ React root element found"
else
    echo "   ❌ React root element NOT found"
fi

if [[ "$BODY" == *"main.*.js"* ]]; then
    echo "   ✅ JavaScript bundle reference found"
else
    echo "   ❌ JavaScript bundle reference NOT found"
fi

if [[ "$BODY" == *"main.*.css"* ]]; then
    echo "   ✅ CSS bundle reference found"
else
    echo "   ❌ CSS bundle reference NOT found"
fi

echo -e "\n2. Testing static assets:"

# Extract JS and CSS URLs
JS_URL=$(echo "$BODY" | grep -o '/static/js/main\.[^"]*\.js' | head -1)
CSS_URL=$(echo "$BODY" | grep -o '/static/css/main\.[^"]*\.css' | head -1)

if [ ! -z "$JS_URL" ]; then
    JS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL$JS_URL")
    JS_SIZE=$(curl -s -I "$URL$JS_URL" | grep -i content-length | awk '{print $2}' | tr -d '\r')
    echo "   JavaScript: $URL$JS_URL"
    echo "   Status: $JS_STATUS, Size: $JS_SIZE bytes"
fi

if [ ! -z "$CSS_URL" ]; then
    CSS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL$CSS_URL")
    CSS_SIZE=$(curl -s -I "$URL$CSS_URL" | grep -i content-length | awk '{print $2}' | tr -d '\r')
    echo "   CSS: $URL$CSS_URL"
    echo "   Status: $CSS_STATUS, Size: $CSS_SIZE bytes"
fi

echo -e "\n3. Testing API endpoints:"
API_HEALTH=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$URL/api/health")
API_STATUS=$(echo "$API_HEALTH" | grep "HTTP_CODE:" | cut -d':' -f2)
API_BODY=$(echo "$API_HEALTH" | sed '/HTTP_CODE:/d')

echo "   /api/health: $API_STATUS"
echo "   Response: $API_BODY"

echo -e "\n4. Testing login API:"
LOGIN_RESPONSE=$(curl -s -X POST "$URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}' \
  -w "\nHTTP_CODE:%{http_code}")

LOGIN_STATUS=$(echo "$LOGIN_RESPONSE" | grep "HTTP_CODE:" | cut -d':' -f2)
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | sed '/HTTP_CODE:/d')

echo "   /api/auth/login: $LOGIN_STATUS"
if [[ "$LOGIN_BODY" == *"success\":true"* ]]; then
    echo "   ✅ Login successful"
else
    echo "   ❌ Login failed"
fi

echo -e "\n5. Checking for common issues:"

# Check Content-Type headers
echo -e "\n   Checking MIME types:"
JS_CONTENT_TYPE=$(curl -s -I "$URL$JS_URL" | grep -i content-type | cut -d':' -f2 | tr -d ' \r')
CSS_CONTENT_TYPE=$(curl -s -I "$URL$CSS_URL" | grep -i content-type | cut -d':' -f2 | tr -d ' \r')

echo "   JS Content-Type: $JS_CONTENT_TYPE"
if [[ "$JS_CONTENT_TYPE" == *"javascript"* ]]; then
    echo "   ✅ Correct JavaScript MIME type"
else
    echo "   ❌ Wrong JavaScript MIME type"
fi

echo "   CSS Content-Type: $CSS_CONTENT_TYPE"
if [[ "$CSS_CONTENT_TYPE" == *"css"* ]]; then
    echo "   ✅ Correct CSS MIME type"
else
    echo "   ❌ Wrong CSS MIME type"
fi

echo -e "\n6. Preview of HTML content:"
echo "$BODY" | head -20

echo -e "\n✅ Test completed!"