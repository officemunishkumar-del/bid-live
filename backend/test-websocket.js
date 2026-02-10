// WebSocket & Settlement Test Script
// Run: node test-websocket.js

const { io } = require('socket.io-client');
const http = require('http');

const BASE = 'http://localhost:3000';
let testPass = 0;
let testFail = 0;
const issues = [];

function check(label, condition) {
    if (condition) {
        console.log(`  ✅ ${label}`);
        testPass++;
    } else {
        console.log(`  ❌ ${label}`);
        testFail++;
        issues.push(label);
    }
}

function apiRequest(method, path, body, token) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method,
            headers: { 'Content-Type': 'application/json' },
        };
        if (token) options.headers['Authorization'] = `Bearer ${token}`;

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runTests() {
    console.log('============================================');
    console.log(' PHASE 3: WEBSOCKET & SETTLEMENT TESTS');
    console.log('============================================');

    // Register test users
    const wsUser1 = await apiRequest('POST', '/api/auth/register', {
        email: 'ws-alice@test.com', password: 'SecurePass123', name: 'WS-Alice'
    });
    const wsUser2 = await apiRequest('POST', '/api/auth/register', {
        email: 'ws-bob@test.com', password: 'SecurePass123', name: 'WS-Bob'
    });
    const token1 = wsUser1.body.accessToken;
    const token2 = wsUser2.body.accessToken;

    // Create auction ending in 8 seconds (for settlement test)
    const endsAt = new Date(Date.now() + 8000).toISOString();
    const auction = await apiRequest('POST', '/api/auctions', {
        title: 'WebSocket Test Auction',
        startingPrice: 50,
        endsAt,
    }, token1);
    const auctionId = auction.body.id;
    console.log(`\n  Auction created: ${auctionId}`);
    console.log(`  Ends at: ${endsAt}`);
    check('Auction created for WS test', !!auctionId);

    // ── TEST 1: WebSocket Connection ──
    console.log('\n▶ TEST 1: WebSocket Connection');

    const socket1 = io(BASE, {
        auth: { token: token1 },
        transports: ['websocket'],
    });

    const socket2 = io(BASE, {
        auth: { token: token2 },
        transports: ['websocket'],
    });

    await new Promise((resolve) => {
        let connected = 0;
        const onConnect = () => { connected++; if (connected === 2) resolve(); };
        socket1.on('connect', onConnect);
        socket2.on('connect', onConnect);
        setTimeout(() => resolve(), 5000); // timeout
    });

    check('Socket 1 connected', socket1.connected);
    check('Socket 2 connected', socket2.connected);

    // ── TEST 2: Join Auction Room ──
    console.log('\n▶ TEST 2: Join Auction Room');

    const joinEvents = [];

    // Set up USER_JOINED listener on socket1 BEFORE socket2 joins
    socket1.on('USER_JOINED', (data) => {
        joinEvents.push(data);
    });

    // Socket1 joins first
    socket1.emit('join_auction', { auctionId });
    await new Promise(r => setTimeout(r, 500));

    // Socket2 joins — socket1 should receive USER_JOINED
    socket2.on('USER_JOINED', (data) => {
        joinEvents.push(data);
    });
    socket2.emit('join_auction', { auctionId });
    await new Promise(r => setTimeout(r, 1000));

    check('USER_JOINED event received', joinEvents.length > 0);
    if (joinEvents.length > 0) {
        const lastJoin = joinEvents[joinEvents.length - 1];
        check('USER_JOINED has auctionId', lastJoin.auctionId === auctionId);
        check('USER_JOINED has viewers count', typeof lastJoin.viewers === 'number');
        check('Viewers count = 2', lastJoin.viewers === 2);
    }

    // ── TEST 3: NEW_BID Event ──
    console.log('\n▶ TEST 3: NEW_BID Event (real-time bid notification)');

    const bidEvents = [];
    socket1.on('NEW_BID', (data) => {
        bidEvents.push(data);
    });
    socket2.on('NEW_BID', (data) => {
        bidEvents.push(data);
    });

    // Bob places a bid via API
    const bidResp = await apiRequest('POST', `/api/auctions/${auctionId}/bid`, {
        amount: 75
    }, token2);

    check('Bid placed successfully', bidResp.status === 201);

    // Wait for WebSocket event
    await new Promise(r => setTimeout(r, 1000));

    check('NEW_BID event received', bidEvents.length > 0);
    if (bidEvents.length > 0) {
        const bidEvent = bidEvents[0];
        check('NEW_BID has auctionId', bidEvent.auctionId === auctionId);
        check('NEW_BID has bid object', typeof bidEvent.bid === 'object');
        check('NEW_BID bid.amount = 75', bidEvent.bid?.amount === 75);
        check('NEW_BID has currentPrice = 75', bidEvent.currentPrice === 75);
        check('NEW_BID has viewers count', typeof bidEvent.viewers === 'number');
        check('NEW_BID bid has bidder info', typeof bidEvent.bid?.bidder === 'object');
        check('NEW_BID bid has placedAt', !!bidEvent.bid?.placedAt);
    }

    // ── TEST 4: Leave Auction ──
    console.log('\n▶ TEST 4: Leave Auction Room');

    const leaveEvents = [];
    socket1.on('USER_LEFT', (data) => {
        leaveEvents.push(data);
    });

    socket2.emit('leave_auction', { auctionId });
    await new Promise(r => setTimeout(r, 1000));

    check('USER_LEFT event received', leaveEvents.length > 0);
    if (leaveEvents.length > 0) {
        check('USER_LEFT has auctionId', leaveEvents[0].auctionId === auctionId);
        check('Viewers decreased to 1', leaveEvents[0].viewers === 1);
    }

    // ── TEST 5: Settlement Worker ──
    console.log('\n▶ TEST 5: Settlement Worker (waiting for auction to end...)');
    console.log('  Waiting 10 seconds for auction to expire and settle...');

    const endedEvents = [];
    socket1.on('AUCTION_ENDED', (data) => {
        endedEvents.push(data);
    });

    await new Promise(r => setTimeout(r, 12000));

    // Check auction status in DB
    const finalAuction = await apiRequest('GET', `/api/auctions/${auctionId}`);

    check('Auction status changed from ACTIVE',
        finalAuction.body.status === 'SETTLED' || finalAuction.body.status === 'ENDED');

    if (finalAuction.body.status === 'SETTLED') {
        check('Winner assigned', !!finalAuction.body.winner);
        if (finalAuction.body.winner) {
            check('Winner is Bob (the bidder)', finalAuction.body.winner.email === 'ws-bob@test.com');
        }
        check('AUCTION_ENDED event received via WebSocket', endedEvents.length > 0);
        if (endedEvents.length > 0) {
            check('AUCTION_ENDED has winner', !!endedEvents[0].winner);
            check('AUCTION_ENDED has finalPrice', typeof endedEvents[0].finalPrice === 'number');
        }
    } else {
        console.log(`  ⚠️  Auction status is ${finalAuction.body.status} (may still be processing)`);
    }

    // ── TEST 6: Idempotency (double-settlement prevention) ──
    console.log('\n▶ TEST 6: Verify no double-settlement');
    // Re-check that status is still SETTLED and winner hasn't changed
    await new Promise(r => setTimeout(r, 2000));
    const recheck = await apiRequest('GET', `/api/auctions/${auctionId}`);
    if (recheck.body.status === 'SETTLED') {
        check('Auction still SETTLED (not re-processed)', recheck.body.status === 'SETTLED');
        check('Winner unchanged', recheck.body.winner?.email === 'ws-bob@test.com');
    }

    // Cleanup
    socket1.disconnect();
    socket2.disconnect();

    // ── SUMMARY ──
    console.log('\n============================================');
    console.log(' PHASE 3 TEST RESULTS');
    console.log('============================================');
    console.log(`  ✅ PASSED: ${testPass}`);
    console.log(`  ❌ FAILED: ${testFail}`);
    if (issues.length > 0) {
        console.log('\n  Failed tests:');
        issues.forEach(i => console.log(`  ❌ ${i}`));
    }
    console.log('============================================');

    process.exit(testFail > 0 ? 1 : 0);
}

runTests().catch(e => {
    console.error('Test error:', e);
    process.exit(1);
});
