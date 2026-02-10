#!/bin/bash
# ==========================================
# PHASE 2: BUSINESS LOGIC & CONCURRENCY
# ==========================================

BASE="http://localhost:3000/api"
source /tmp/livebid_test_vars.sh

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
echo " PHASE 2: BUSINESS LOGIC & CONCURRENCY"
echo "============================================"

# ── TEST 1: Outbid & Refund ──
echo ""
echo "▶ TEST 1: Outbid & Previous Bidder Refund"

# Register Charlie
CHARLIE_RESP=$(curl -s -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"charlie@test.com","password":"SecurePass123","name":"Charlie"}')
CHARLIE_TOKEN=$(echo "$CHARLIE_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('accessToken',''))" 2>/dev/null)

# Charlie outbids Bob on the existing auction
curl -s -X POST "$BASE/auctions/$AUCTION_ID/bid" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CHARLIE_TOKEN" \
  -d '{"amount":200}' > /dev/null 2>&1

# Check Bob was refunded (850 + 150 = 1000)
BOB_BALANCE=$(curl -s "$BASE/users/me" -H "Authorization: Bearer $BOB_TOKEN" | \
  python3 -c "import sys,json; print(json.load(sys.stdin).get('balance',0))" 2>/dev/null)
check "Bob refunded after outbid: balance=1000" "$(python3 -c "print('true' if float($BOB_BALANCE)==1000 else 'false')" 2>/dev/null)"

# Check Charlie balance deducted (1000 - 200 = 800)
CHARLIE_BALANCE=$(curl -s "$BASE/users/me" -H "Authorization: Bearer $CHARLIE_TOKEN" | \
  python3 -c "import sys,json; print(json.load(sys.stdin).get('balance',0))" 2>/dev/null)
check "Charlie balance deducted: 800" "$(python3 -c "print('true' if float($CHARLIE_BALANCE)==800 else 'false')" 2>/dev/null)"

# Auction price updated
CURR=$(curl -s "$BASE/auctions/$AUCTION_ID" | python3 -c "import sys,json; print(json.load(sys.stdin).get('currentPrice',0))" 2>/dev/null)
check "Auction currentPrice=200 after outbid" "$(python3 -c "print('true' if float($CURR)==200 else 'false')" 2>/dev/null)"

# ── TEST 2: Self-Outbid (Same bidder raises own bid) ──
echo ""
echo "▶ TEST 2: Self-Outbid (Charlie raises own bid)"

# Charlie self-outbids from 200 to 300
# Expected: Charlie's old 200 refunded, then new 300 deducted → 800+200-300=700
curl -s -X POST "$BASE/auctions/$AUCTION_ID/bid" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CHARLIE_TOKEN" \
  -d '{"amount":300}' > /dev/null 2>&1

CHARLIE_BALANCE2=$(curl -s "$BASE/users/me" -H "Authorization: Bearer $CHARLIE_TOKEN" | \
  python3 -c "import sys,json; print(json.load(sys.stdin).get('balance',0))" 2>/dev/null)
check "Self-outbid: Charlie balance=700 (1000-300)" "$(python3 -c "print('true' if float($CHARLIE_BALANCE2)==700 else 'false')" 2>/dev/null)"

# ── TEST 3: Insufficient Balance ──
echo ""
echo "▶ TEST 3: Insufficient Balance → 403"

# Register Dave with default 1000 balance
DAVE_RESP=$(curl -s -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"dave@test.com","password":"SecurePass123","name":"Dave"}')
DAVE_TOKEN=$(echo "$DAVE_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('accessToken',''))" 2>/dev/null)

# Try to bid 2000 (more than balance)
INSUFF_RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auctions/$AUCTION_ID/bid" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DAVE_TOKEN" \
  -d '{"amount":2000}')
INSUFF_CODE=$(echo "$INSUFF_RESP" | tail -1)
check "Status 403 on insufficient balance" "$([ "$INSUFF_CODE" = "403" ] && echo true || echo false)"

# Verify Dave's balance unchanged
DAVE_BAL=$(curl -s "$BASE/users/me" -H "Authorization: Bearer $DAVE_TOKEN" | \
  python3 -c "import sys,json; print(json.load(sys.stdin).get('balance',0))" 2>/dev/null)
check "Dave balance unchanged (1000) after failed bid" "$(python3 -c "print('true' if float($DAVE_BAL)==1000 else 'false')" 2>/dev/null)"

# ── TEST 4: Bid on Ended Auction ──
echo ""
echo "▶ TEST 4: Bid on Ended Auction"

# Create an auction that ends in the past (or very soon -- we'll manually expire it)
PAST_DATE=$(date -d '-1 hour' --iso-8601=seconds)
EXPIRED_RESP=$(curl -s -X POST "$BASE/auctions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -d "{\"title\":\"Expired Item\",\"startingPrice\":50,\"endsAt\":\"$PAST_DATE\"}")
EXPIRED_ID=$(echo "$EXPIRED_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)

# Try to bid on expired auction
if [ -n "$EXPIRED_ID" ] && [ "$EXPIRED_ID" != "" ]; then
  EXPIRED_BID=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auctions/$EXPIRED_ID/bid" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $BOB_TOKEN" \
    -d '{"amount":100}')
  EXPIRED_BID_CODE=$(echo "$EXPIRED_BID" | tail -1)
  check "Status 409 on expired auction bid" "$([ "$EXPIRED_BID_CODE" = "409" ] && echo true || echo false)"
else
  echo "  ⏭️  Skipped: expired auction creation failed (backend might reject past dates)"
fi

# ── TEST 5: 50 CONCURRENT BIDS ──
echo ""
echo "============================================"
echo " CONCURRENCY TEST: 50 Parallel Bids"
echo "============================================"

# Create a fresh auction for concurrency test
CONC_AUCTION=$(curl -s -X POST "$BASE/auctions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -d "{\"title\":\"Concurrency Test Auction\",\"startingPrice\":10,\"endsAt\":\"$(date -d '+3 hours' --iso-8601=seconds)\"}")
CONC_ID=$(echo "$CONC_AUCTION" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
echo "  Auction ID: $CONC_ID"

# Register 50 bidders
echo "  Registering 50 bidders..."
declare -a BIDDER_TOKENS
for i in $(seq 1 50); do
  RESP=$(curl -s -X POST "$BASE/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"bidder${i}@test.com\",\"password\":\"SecurePass123\",\"name\":\"Bidder${i}\"}")
  TOKEN=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('accessToken',''))" 2>/dev/null)
  BIDDER_TOKENS[$i]=$TOKEN
done
echo "  50 bidders registered."

# Fire 50 parallel bids (each bidding amount = 10 + i)
echo "  Firing 50 parallel bids..."
TMPDIR=$(mktemp -d)
for i in $(seq 1 50); do
  AMOUNT=$((10 + i))
  (
    RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auctions/$CONC_ID/bid" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${BIDDER_TOKENS[$i]}" \
      -d "{\"amount\":$AMOUNT}")
    echo "$RESP" > "$TMPDIR/bid_$i.txt"
  ) &
done
wait
echo "  All 50 bids completed."

# Analyze results
SUCCESS=0
CONFLICT=0
OTHER=0
for i in $(seq 1 50); do
  CODE=$(tail -1 "$TMPDIR/bid_$i.txt")
  if [ "$CODE" = "201" ]; then
    ((SUCCESS++))
  elif [ "$CODE" = "409" ]; then
    ((CONFLICT++))
  else
    ((OTHER++))
  fi
done

echo ""
echo "  Results:"
echo "    201 (Success): $SUCCESS"
echo "    409 (Conflict/outbid): $CONFLICT"
echo "    Other: $OTHER"

# Verify final state
FINAL_AUCTION=$(curl -s "$BASE/auctions/$CONC_ID")
FINAL_PRICE=$(echo "$FINAL_AUCTION" | python3 -c "import sys,json; print(json.load(sys.stdin).get('currentPrice',0))" 2>/dev/null)
echo "    Final price: $FINAL_PRICE"

# The highest bid should be 60 (10+50)
check "Final price = 60 (highest bid wins)" "$(python3 -c "print('true' if float($FINAL_PRICE)==60 else 'false')" 2>/dev/null)"

# Get bid count
BID_HISTORY=$(curl -s "$BASE/auctions/$CONC_ID/bids")
BID_COUNT=$(echo "$BID_HISTORY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('total',0))" 2>/dev/null)
echo "    Total bids recorded: $BID_COUNT"

# With 50 sequential amounts, only some can succeed (each must be higher than previous)
# The exact count depends on execution order, but there should be at least 1 and no more than 50
check "Bid count > 0 (at least one succeeded)" "$(python3 -c "print('true' if int($BID_COUNT)>0 else 'false')" 2>/dev/null)"
check "Bid count <= 50 (no phantom bids)" "$(python3 -c "print('true' if int($BID_COUNT)<=50 else 'false')" 2>/dev/null)"

# ── TEST 6: No negative balances ──
echo ""
echo "▶ TEST 6: Verify NO negative balances"
# The winning bidder's balance should be exactly 1000 - 60 = 940
# All other bidders should have been refunded to 1000
NEGATIVE_FOUND=false
for i in $(seq 1 50); do
  BAL=$(curl -s "$BASE/users/me" -H "Authorization: Bearer ${BIDDER_TOKENS[$i]}" | \
    python3 -c "import sys,json; print(json.load(sys.stdin).get('balance',0))" 2>/dev/null)
  if python3 -c "import sys; sys.exit(0 if float($BAL) >= 0 else 1)" 2>/dev/null; then
    : # OK
  else
    NEGATIVE_FOUND=true
    echo "  ❌ NEGATIVE BALANCE: bidder$i has balance=$BAL"
  fi
done
check "No negative balances found" "$([ "$NEGATIVE_FOUND" = "false" ] && echo true || echo false)"

# ── TEST 7: Total system balance integrity ──
echo ""
echo "▶ TEST 7: System Balance Integrity"
# Sum all balances + current bid escrow should equal total initial deposits
TOTAL_BAL=0
for i in $(seq 1 50); do
  BAL=$(curl -s "$BASE/users/me" -H "Authorization: Bearer ${BIDDER_TOKENS[$i]}" | \
    python3 -c "import sys,json; print(json.load(sys.stdin).get('balance',0))" 2>/dev/null)
  TOTAL_BAL=$(python3 -c "print(float($TOTAL_BAL) + float($BAL))" 2>/dev/null)
done
# Add the escrowed amount (current bid of winning bidder = 60)
TOTAL_WITH_ESCROW=$(python3 -c "print(float($TOTAL_BAL) + float($FINAL_PRICE))" 2>/dev/null)
# Should be 50 * 1000 = 50000
check "System balance integrity: sum+escrow = 50000" "$(python3 -c "print('true' if abs(float($TOTAL_WITH_ESCROW) - 50000) < 0.01 else 'false')" 2>/dev/null)"

rm -rf "$TMPDIR"

# ── SUMMARY ──
echo ""
echo "============================================"
echo " PHASE 2 TEST RESULTS"
echo "============================================"
echo "  ✅ PASSED: $PASS"
echo "  ❌ FAILED: $FAIL"
if [ $FAIL -gt 0 ]; then
  echo ""
  echo "  Failed tests:"
  echo -e "$ISSUES"
fi
echo "============================================"
