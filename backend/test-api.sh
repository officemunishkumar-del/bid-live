#!/bin/bash
# ===========================
# LIVEBID API CONTRACT TESTS
# ===========================

BASE="http://localhost:3000/api"
PASS=0
FAIL=0
ISSUES=""

check() {
  local label="$1"
  local condition="$2"
  if [ "$condition" = "true" ]; then
    echo "  ✅ $label"
    ((PASS++))
  else
    echo "  ❌ $label"
    ((FAIL++))
    ISSUES="$ISSUES\n  ❌ $label"
  fi
}

echo "============================================"
echo " PHASE 1: API CONTRACT COMPLIANCE TESTS"
echo "============================================"

# ── TEST 1: POST /auth/register ──
echo ""
echo "▶ TEST 1: POST /auth/register"
REG_RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"SecurePass123","name":"Alice"}')
REG_BODY=$(echo "$REG_RESP" | head -n -1)
REG_CODE=$(echo "$REG_RESP" | tail -1)

check "Status 201 on register" "$([ "$REG_CODE" = "201" ] && echo true || echo false)"
check "Response has accessToken" "$(echo "$REG_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('true' if 'accessToken' in d else 'false')" 2>/dev/null)"
check "Response has user.id" "$(echo "$REG_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('true' if 'id' in d.get('user',{}) else 'false')" 2>/dev/null)"
check "Response has user.email" "$(echo "$REG_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('true' if d.get('user',{}).get('email')=='alice@test.com' else 'false')" 2>/dev/null)"
check "Response has user.balance=1000" "$(echo "$REG_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('true' if d.get('user',{}).get('balance')==1000 else 'false')" 2>/dev/null)"

ALICE_TOKEN=$(echo "$REG_BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('accessToken',''))" 2>/dev/null)
ALICE_ID=$(echo "$REG_BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('user',{}).get('id',''))" 2>/dev/null)

# ── TEST 1b: Duplicate registration → 409 ──
echo ""
echo "▶ TEST 1b: Duplicate registration → 409"
DUP_RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"Pass123","name":"Dup"}')
DUP_CODE=$(echo "$DUP_RESP" | tail -1)
check "Status 409 on duplicate email" "$([ "$DUP_CODE" = "409" ] && echo true || echo false)"

# ── TEST 1c: Validation error (missing password) ──
echo ""
echo "▶ TEST 1c: Validation error on register"
VAL_RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"bad@test.com"}')
VAL_CODE=$(echo "$VAL_RESP" | tail -1)
check "Status 400 on missing password" "$([ "$VAL_CODE" = "400" ] && echo true || echo false)"

# ── TEST 2: POST /auth/login ──
echo ""
echo "▶ TEST 2: POST /auth/login"
LOGIN_RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"SecurePass123"}')
LOGIN_BODY=$(echo "$LOGIN_RESP" | head -n -1)
LOGIN_CODE=$(echo "$LOGIN_RESP" | tail -1)

check "Status 201 on login" "$([ "$LOGIN_CODE" = "201" ] && echo true || echo false)"
check "Login returns accessToken" "$(echo "$LOGIN_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('true' if 'accessToken' in d else 'false')" 2>/dev/null)"
check "Login returns user object" "$(echo "$LOGIN_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('true' if 'user' in d else 'false')" 2>/dev/null)"

# ── TEST 2b: Bad credentials → 401 ──
echo ""
echo "▶ TEST 2b: Bad credentials → 401"
BAD_LOGIN=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"WrongPass"}')
BAD_CODE=$(echo "$BAD_LOGIN" | tail -1)
check "Status 401 on bad credentials" "$([ "$BAD_CODE" = "401" ] && echo true || echo false)"

# ── TEST 3: GET /users/me (Profile) ──
echo ""
echo "▶ TEST 3: GET /users/me (Profile)"
PROFILE_RESP=$(curl -s -w "\n%{http_code}" "$BASE/users/me" \
  -H "Authorization: Bearer $ALICE_TOKEN")
PROFILE_BODY=$(echo "$PROFILE_RESP" | head -n -1)
PROFILE_CODE=$(echo "$PROFILE_RESP" | tail -1)

check "Status 200 on profile" "$([ "$PROFILE_CODE" = "200" ] && echo true || echo false)"
check "Profile has id" "$(echo "$PROFILE_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('true' if 'id' in d else 'false')" 2>/dev/null)"
check "Profile has balance" "$(echo "$PROFILE_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('true' if 'balance' in d else 'false')" 2>/dev/null)"
check "Profile has availableBalance" "$(echo "$PROFILE_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('true' if 'availableBalance' in d else 'false')" 2>/dev/null)"
check "Profile has createdAuctions array" "$(echo "$PROFILE_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('true' if isinstance(d.get('createdAuctions'), list) else 'false')" 2>/dev/null)"
check "Profile has wonAuctions array" "$(echo "$PROFILE_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('true' if isinstance(d.get('wonAuctions'), list) else 'false')" 2>/dev/null)"

# ── TEST 3b: Unauthorized profile → 401 ──
echo ""
echo "▶ TEST 3b: Unauthorized profile → 401"
UNAUTH_RESP=$(curl -s -w "\n%{http_code}" "$BASE/users/me")
UNAUTH_CODE=$(echo "$UNAUTH_RESP" | tail -1)
check "Status 401 without token" "$([ "$UNAUTH_CODE" = "401" ] && echo true || echo false)"

# ── TEST 4: POST /auctions (Create) ──
echo ""
echo "▶ TEST 4: POST /auctions (Create)"
ENDS_AT=$(date -d '+2 hours' --iso-8601=seconds)
CREATE_RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auctions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -d "{\"title\":\"Vintage Watch\",\"description\":\"A rare 1960s watch\",\"startingPrice\":100,\"endsAt\":\"$ENDS_AT\"}")
CREATE_BODY=$(echo "$CREATE_RESP" | head -n -1)
CREATE_CODE=$(echo "$CREATE_RESP" | tail -1)

check "Status 201 on create auction" "$([ "$CREATE_CODE" = "201" ] && echo true || echo false)"
check "Auction has UUID id" "$(echo "$CREATE_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('true' if len(d.get('id',''))==36 else 'false')" 2>/dev/null)"
check "Auction status is ACTIVE" "$(echo "$CREATE_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('true' if d.get('status')=='ACTIVE' else 'false')" 2>/dev/null)"
check "currentPrice equals startingPrice" "$(echo "$CREATE_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('true' if float(d.get('currentPrice',0))==100 else 'false')" 2>/dev/null)"

AUCTION_ID=$(echo "$CREATE_BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)

# ── TEST 4b: Create auction without auth → 401 ──
echo ""
echo "▶ TEST 4b: Create auction without auth → 401"
NO_AUTH_CREATE=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auctions" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","startingPrice":100,"endsAt":"2026-03-01T00:00:00Z"}')
NO_AUTH_CODE=$(echo "$NO_AUTH_CREATE" | tail -1)
check "Status 401 without token on create" "$([ "$NO_AUTH_CODE" = "401" ] && echo true || echo false)"

# ── TEST 4c: Create auction with validation error → 400 ──
echo ""
echo "▶ TEST 4c: Create auction validation error → 400"
BAD_CREATE=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auctions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -d '{"title":"X"}')
BAD_CREATE_CODE=$(echo "$BAD_CREATE" | tail -1)
check "Status 400 on missing required fields" "$([ "$BAD_CREATE_CODE" = "400" ] && echo true || echo false)"

# ── TEST 5: GET /auctions (List) ──
echo ""
echo "▶ TEST 5: GET /auctions (List with pagination)"
LIST_RESP=$(curl -s -w "\n%{http_code}" "$BASE/auctions?page=1&limit=10")
LIST_BODY=$(echo "$LIST_RESP" | head -n -1)
LIST_CODE=$(echo "$LIST_RESP" | tail -1)

check "Status 200 on list auctions" "$([ "$LIST_CODE" = "200" ] && echo true || echo false)"
check "Response has data array" "$(echo "$LIST_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('true' if isinstance(d.get('data'), list) else 'false')" 2>/dev/null)"
check "Response has total count" "$(echo "$LIST_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('true' if 'total' in d else 'false')" 2>/dev/null)"
check "Response has page number" "$(echo "$LIST_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('true' if 'page' in d else 'false')" 2>/dev/null)"
check "Response has lastPage" "$(echo "$LIST_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('true' if 'lastPage' in d else 'false')" 2>/dev/null)"
check "total >= 1" "$(echo "$LIST_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('true' if d.get('total',0)>=1 else 'false')" 2>/dev/null)"

# ── TEST 5b: GET /auctions?status=active ──
echo ""
echo "▶ TEST 5b: GET /auctions?status=active"
ACTIVE_RESP=$(curl -s "$BASE/auctions?status=active")
check "Status filter returns data" "$(echo "$ACTIVE_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print('true' if d.get('total',0)>=1 else 'false')" 2>/dev/null)"

# ── TEST 6: GET /auctions/:id ──
echo ""
echo "▶ TEST 6: GET /auctions/:id (Detail)"
DETAIL_RESP=$(curl -s -w "\n%{http_code}" "$BASE/auctions/$AUCTION_ID")
DETAIL_BODY=$(echo "$DETAIL_RESP" | head -n -1)
DETAIL_CODE=$(echo "$DETAIL_RESP" | tail -1)

check "Status 200 on auction detail" "$([ "$DETAIL_CODE" = "200" ] && echo true || echo false)"
check "Detail has title" "$(echo "$DETAIL_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('true' if d.get('title')=='Vintage Watch' else 'false')" 2>/dev/null)"
check "Detail has currentPrice (number)" "$(echo "$DETAIL_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('true' if isinstance(d.get('currentPrice'), (int,float)) else 'false')" 2>/dev/null)"
check "Detail has endsAt" "$(echo "$DETAIL_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('true' if 'endsAt' in d else 'false')" 2>/dev/null)"
check "Detail has creator object" "$(echo "$DETAIL_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('true' if isinstance(d.get('creator'), dict) else 'false')" 2>/dev/null)"
check "Detail has status=ACTIVE" "$(echo "$DETAIL_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('true' if d.get('status')=='ACTIVE' else 'false')" 2>/dev/null)"
check "Detail has bids array" "$(echo "$DETAIL_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('true' if isinstance(d.get('bids'), list) else 'false')" 2>/dev/null)"
check "Creator password NOT leaked" "$(echo "$DETAIL_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); c=d.get('creator',{}); print('true' if 'password' not in c else 'false')" 2>/dev/null)"

# ── TEST 6b: Non-existent auction → 404/500 ──
echo ""
echo "▶ TEST 6b: Non-existent auction"
FAKE_RESP=$(curl -s -w "\n%{http_code}" "$BASE/auctions/00000000-0000-0000-0000-000000000000")
FAKE_CODE=$(echo "$FAKE_RESP" | tail -1)
check "404 or error on fake auction ID" "$([ "$FAKE_CODE" = "404" ] || [ "$FAKE_CODE" = "500" ] && echo true || echo false)"

# ── Register Bob for bidding tests ──
echo ""
echo "▶ Registering second user (Bob) for bid tests..."
BOB_RESP=$(curl -s -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@test.com","password":"SecurePass123","name":"Bob"}')
BOB_TOKEN=$(echo "$BOB_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('accessToken',''))" 2>/dev/null)
BOB_ID=$(echo "$BOB_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('user',{}).get('id',''))" 2>/dev/null)

# ── TEST 7: POST /auctions/:id/bid ──
echo ""
echo "▶ TEST 7: POST /auctions/:id/bid (Place bid)"
BID_RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auctions/$AUCTION_ID/bid" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BOB_TOKEN" \
  -d '{"amount":150}')
BID_BODY=$(echo "$BID_RESP" | head -n -1)
BID_CODE=$(echo "$BID_RESP" | tail -1)

check "Status 201 on place bid" "$([ "$BID_CODE" = "201" ] && echo true || echo false)"
check "Bid has id" "$(echo "$BID_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('true' if 'id' in d else 'false')" 2>/dev/null)"
check "Bid amount=150" "$(echo "$BID_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('true' if d.get('amount')==150 else 'false')" 2>/dev/null)"
check "Bid has placedAt" "$(echo "$BID_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('true' if 'placedAt' in d else 'false')" 2>/dev/null)"

# ── TEST 7b: Verify balance deducted ──
echo ""
echo "▶ TEST 7b: Verify bidder balance deduction (escrow)"
BOB_PROFILE=$(curl -s "$BASE/users/me" -H "Authorization: Bearer $BOB_TOKEN")
BOB_BALANCE=$(echo "$BOB_PROFILE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('balance',0))" 2>/dev/null)
check "Bob balance = 850 (1000 - 150)" "$(echo "$BOB_BALANCE" | python3 -c "bal=float(input()); print('true' if bal==850 else 'false')" 2>/dev/null)"

# ── TEST 7c: Verify auction currentPrice updated ──
echo ""
echo "▶ TEST 7c: Verify auction currentPrice updated"
UPDATED_AUCTION=$(curl -s "$BASE/auctions/$AUCTION_ID")
CURR_PRICE=$(echo "$UPDATED_AUCTION" | python3 -c "import sys,json; print(json.load(sys.stdin).get('currentPrice',0))" 2>/dev/null)
check "Auction currentPrice = 150" "$(echo "$CURR_PRICE" | python3 -c "p=float(input()); print('true' if p==150 else 'false')" 2>/dev/null)"

# ── TEST 7d: Bid too low → 409 ──
echo ""
echo "▶ TEST 7d: Bid below current price → 409"
LOW_BID=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auctions/$AUCTION_ID/bid" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BOB_TOKEN" \
  -d '{"amount":100}')
LOW_BID_CODE=$(echo "$LOW_BID" | tail -1)
check "Status 409 on bid too low" "$([ "$LOW_BID_CODE" = "409" ] && echo true || echo false)"

# ── TEST 7e: Bid on own auction → 403 ──
echo ""
echo "▶ TEST 7e: Bid on own auction → 403"
OWN_BID=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auctions/$AUCTION_ID/bid" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -d '{"amount":200}')
OWN_BID_CODE=$(echo "$OWN_BID" | tail -1)
check "Status 403 on bidding own auction" "$([ "$OWN_BID_CODE" = "403" ] && echo true || echo false)"

# ── TEST 7f: Bid without auth → 401 ──
echo ""
echo "▶ TEST 7f: Bid without auth → 401"
NOAUTH_BID=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auctions/$AUCTION_ID/bid" \
  -H "Content-Type: application/json" \
  -d '{"amount":200}')
NOAUTH_BID_CODE=$(echo "$NOAUTH_BID" | tail -1)
check "Status 401 on unauthenticated bid" "$([ "$NOAUTH_BID_CODE" = "401" ] && echo true || echo false)"

# ── TEST 8: GET /auctions/:id/bids ──
echo ""
echo "▶ TEST 8: GET /auctions/:id/bids (Bid history)"
BIDS_RESP=$(curl -s -w "\n%{http_code}" "$BASE/auctions/$AUCTION_ID/bids")
BIDS_BODY=$(echo "$BIDS_RESP" | head -n -1)
BIDS_CODE=$(echo "$BIDS_RESP" | tail -1)

check "Status 200 on bid history" "$([ "$BIDS_CODE" = "200" ] && echo true || echo false)"
check "Has data array" "$(echo "$BIDS_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('true' if isinstance(d.get('data'), list) else 'false')" 2>/dev/null)"
check "Has total count" "$(echo "$BIDS_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('true' if 'total' in d else 'false')" 2>/dev/null)"
check "total = 1" "$(echo "$BIDS_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('true' if d.get('total')==1 else 'false')" 2>/dev/null)"
check "Bid has bidder info" "$(echo "$BIDS_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); b=d.get('data',[]); print('true' if b and 'bidder' in b[0] else 'false')" 2>/dev/null)"
check "Bidder password NOT leaked" "$(echo "$BIDS_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); b=d.get('data',[])[0].get('bidder',{}); print('true' if 'password' not in b else 'false')" 2>/dev/null)"

# ── SUMMARY ──
echo ""
echo "============================================"
echo " API CONTRACT TEST RESULTS"
echo "============================================"
echo "  ✅ PASSED: $PASS"
echo "  ❌ FAILED: $FAIL"
if [ $FAIL -gt 0 ]; then
  echo ""
  echo "  Failed tests:"
  echo -e "$ISSUES"
fi
echo "============================================"

# Export values for Phase 2
echo "ALICE_TOKEN=$ALICE_TOKEN" > /tmp/livebid_test_vars.sh
echo "ALICE_ID=$ALICE_ID" >> /tmp/livebid_test_vars.sh
echo "BOB_TOKEN=$BOB_TOKEN" >> /tmp/livebid_test_vars.sh
echo "BOB_ID=$BOB_ID" >> /tmp/livebid_test_vars.sh
echo "AUCTION_ID=$AUCTION_ID" >> /tmp/livebid_test_vars.sh
