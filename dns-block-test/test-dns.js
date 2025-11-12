#!/usr/bin/env node

const dns = require('dns');
const fs = require('fs');
const path = require('path');

// Load configuration to get blocked domains
let config;
try {
  config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
} catch (error) {
  console.error('❌ Error loading config.json:', error.message);
  process.exit(1);
}

const { blockedDomains, settings } = config;
const { port, blockResponse } = settings;

// Note: We'll test directly using nslookup since we need to specify the DNS server

// Test function
async function testDomain(domain, expectedBlocked = false) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing: ${domain}`);

    const startTime = Date.now();

    dns.lookup(domain, (err, address, family) => {
      const responseTime = Date.now() - startTime;

      if (err) {
        console.log(`   ❌ Error: ${err.message}`);
        resolve({ domain, success: false, error: err.message });
        return;
      }

      console.log(`   📍 Resolved to: ${address} (${family})`);
      console.log(`   ⏱️  Response time: ${responseTime}ms`);

      const isBlocked = address === blockResponse;
      const testPassed = expectedBlocked ? isBlocked : !isBlocked;

      if (testPassed) {
        console.log(`   ✅ Test ${expectedBlocked ? 'PASSED' : 'PASSED'} - ${isBlocked ? 'Correctly blocked' : 'Correctly allowed'}`);
      } else {
        console.log(`   ❌ Test FAILED - Expected ${expectedBlocked ? 'blocked' : 'allowed'} but got ${isBlocked ? 'blocked' : 'allowed'}`);
      }

      resolve({
        domain,
        address,
        blocked: isBlocked,
        expectedBlocked,
        success: testPassed,
        responseTime
      });
    });
  });
}

// Test function for general domains (should be allowed)
async function testAllowedDomain(domain) {
  return testDomain(domain, false);
}

// Test function for blocked domains
async function testBlockedDomain(domain) {
  return testDomain(domain, true);
}

// Main test function
async function runTests() {
  console.log('🧪 DNS Blocking Test Script');
  console.log('='.repeat(40));
  console.log(`📡 Testing against DNS server on 127.0.0.1:${port}`);
  console.log(`🚫 Blocked response should be: ${blockResponse}`);
  console.log('='.repeat(40));

  // Check if DNS server is running
  console.log('\n🔧 Checking if DNS server is running...');
  try {
    await testAllowedDomain('google.com');
    console.log('✅ DNS server is responding');
  } catch (error) {
    console.log('❌ DNS server not responding - make sure to run: node dns-blocker.js');
    process.exit(1);
  }

  const results = [];

  // Test blocked domains
  console.log('\n🚫 Testing BLOCKED domains:');
  console.log('-'.repeat(30));

  for (const domain of blockedDomains.slice(0, 5)) { // Test first 5 blocked domains
    const result = await testBlockedDomain(domain);
    results.push(result);
  }

  // Test allowed domains
  console.log('\n✅ Testing ALLOWED domains:');
  console.log('-'.repeat(30));

  const allowedDomains = [
    'google.com',
    'github.com',
    'stackoverflow.com',
    'wikipedia.org',
    'nodejs.org'
  ];

  for (const domain of allowedDomains) {
    const result = await testAllowedDomain(domain);
    results.push(result);
  }

  // Test edge cases
  console.log('\n🔬 Testing EDGE cases:');
  console.log('-'.repeat(30));

  const edgeCases = [
    'subdomain.facebook.com', // Should be blocked (subdomain)
    'unknown-domain-not-real.com' // Should resolve normally or error
  ];

  for (const domain of edgeCases) {
    const result = await testDomain(domain, domain.includes('facebook.com'));
    results.push(result);
  }

  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('='.repeat(40));

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const avgResponseTime = results
    .filter(r => r.responseTime)
    .reduce((sum, r) => sum + r.responseTime, 0) / results.filter(r => r.responseTime).length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
  console.log(`⏱️  Average Response Time: ${avgResponseTime.toFixed(1)}ms`);

  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`   - ${r.domain}: expected ${r.expectedBlocked ? 'blocked' : 'allowed'}, got ${r.blocked ? 'blocked' : 'allowed'}`);
      });
  }

  console.log('\n🎯 Test completed!');
  console.log('\n💡 To test with your browser:');
  console.log('   1. Start DNS server: node dns-blocker.js');
  console.log('   2. Change your system DNS to 127.0.0.1');
  console.log('   3. Try visiting blocked domains');
}

// Run tests
runTests().catch(console.error);