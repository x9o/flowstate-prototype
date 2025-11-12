# DNS Blocking Test Script

A standalone Node.js script to test DNS blocking functionality for the FlowState app.

## How It Works

This script creates a local DNS server that:
1. **Intercepts** DNS queries on port 5353 (non-privileged)
2. **Filters** requests against a blacklist of distracting domains
3. **Blocks** blacklisted domains by responding with `0.0.0.0`
4. **Forwards** allowed domains to Google DNS (8.8.8.8)

## Quick Start

### 1. Install Dependencies
```bash
cd dns-block-test
npm install
```

### 2. Start DNS Server
```bash
npm start
```

You should see output like:
```
🚀 DNS Blocking Server started
   📍 Listening on 127.0.0.1:5353
   🚫 Blocking 16 domains
   🔄 Upstream DNS: 8.8.8.8
   ⏹️  Blocked domains respond with: 0.0.0.0

📋 Blocked domains:
   - facebook.com
   - twitter.com
   - instagram.com
   ...
```

### 3. Test Blocking (in another terminal)
```bash
npm test
```

### 4. Manual Testing
```bash
# Test blocked domain
nslookup facebook.com 127.0.0.1 5353
# Should return: 0.0.0.0

# Test allowed domain
nslookup google.com 127.0.0.1 5353
# Should return: real IP address
```

## Configuration

Edit `config.json` to customize:
- **blockedDomains**: List of domains to block
- **settings.port**: DNS server port (default: 5353)
- **settings.upstreamDNS**: Forwarding DNS server
- **settings.blockResponse**: IP to return for blocked domains

## Testing Scenarios

### Automatic Tests
Run `npm test` to automatically test:
- ✅ Blocked domains return `0.0.0.0`
- ✅ Allowed domains resolve normally
- ✅ Subdomains are properly blocked
- ✅ Response times are reasonable

### Browser Testing
To test with your browser:

1. **Start DNS server**: `node dns-blocker.js`
2. **Change system DNS** to `127.0.0.1` (temporary)
3. **Try visiting** blocked domains like facebook.com
4. **Verify** they don't load

**Windows**: Network Settings → Adapter → Properties → DNS Settings
**macOS**: System Preferences → Network → Advanced → DNS
**Linux**: `/etc/resolv.conf` or NetworkManager

## Safety Features

- **Non-privileged port** (5353) - no admin required
- **No system changes** - doesn't modify network settings
- **Graceful shutdown** with Ctrl+C
- **Case-insensitive** domain matching
- **Subdomain blocking** (e.g., m.facebook.com)
- **Error handling** for invalid domains

## Expected Results

✅ **Blocked domains** should resolve to `0.0.0.0`
✅ **Allowed domains** should resolve to real IPs
✅ **Subdomains** of blocked domains should also be blocked
✅ **Response times** should be under 100ms

## Troubleshooting

### "Port already in use"
Change port in `config.json`:
```json
"port": 5354
```

### "DNS server not responding"
Make sure the DNS server is running:
```bash
node dns-blocker.js
```

### Domains not blocking
- Check if domain is in `blockedDomains` list
- Verify domain spelling and case
- Ensure you're testing against port 5353

## Next Steps

If this test works, the DNS blocking can be:
1. **Ported to port 53** with admin privileges
2. **Integrated** into FlowState's monitoring service
3. **Enhanced** with pattern matching and caching
4. **Combined** with other blocking methods

## Technical Notes

- Uses `dns2` package for DNS server functionality
- Blocks only A record queries (most common)
- Returns block response with 5-minute TTL
- Forwards non-blocked queries to upstream DNS
- Safe for testing - won't interfere with system DNS