#!/usr/bin/env node

const dgram = require('dgram');
const dns = require('dns2');
const fs = require('fs');
const path = require('path');

// Load configuration
let config;
try {
  config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
} catch (error) {
  console.error('❌ Error loading config.json:', error.message);
  process.exit(1);
}

const { blockedDomains, settings } = config;
const { port, blockResponse } = settings;

// Function to test a domain against our DNS server
function testDomain(domain) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔍 Testing: ${domain}`);
    console.log(`   Querying DNS server at 127.0.0.1:${port}`);

    // Create DNS query
    const packet = new dns.Packet();
    packet.questions.push({
      name: domain,
      type: 'A'
    });

    const socket = dgram.createSocket('udp4');

    // Set timeout
    const timeout = setTimeout(() => {
      socket.close();
      reject(new Error('Timeout - DNS server not responding'));
    }, 5000);

    socket.on('message', (msg) => {
      clearTimeout(timeout);
      socket.close();

      try {
        const response = dns.Packet.parse(msg);

        if (response.answers.length > 0) {
          const answer = response.answers[0];
          const resolvedIP = answer.address;
          const isBlocked = resolvedIP === blockResponse;

          console.log(`   📍 Resolved to: ${resolvedIP}`);
          console.log(`   ⏱️  Response ID: ${response.id}`);

          if (isBlocked) {
            console.log(`   🚫 BLOCKED ✅`);
          } else {
            console.log(`   ✅ ALLOWED (real IP)`);
          }

          resolve({
            domain,
            address: resolvedIP,
            blocked: isBlocked
          });
        } else {
          console.log(`   ❌ No answers received`);
          reject(new Error('No DNS answers received'));
        }
      } catch (error) {
        console.log(`   ❌ Error parsing response: ${error.message}`);
        reject(error);
      }
    });

    socket.on('error', (error) => {
      clearTimeout(timeout);
      socket.close();
      console.log(`   ❌ Socket error: ${error.message}`);
      reject(error);
    });

    // Send query
    const queryBuffer = packet.toBuffer();
    socket.send(queryBuffer, port, '127.0.0.1', (error) => {
      if (error) {
        clearTimeout(timeout);
        socket.close();
        reject(error);
      }
    });
  });
}

// Test multiple domains
async function runTests() {
  console.log('🧪 DNS Blocking Manual Test');
  console.log('='.repeat(40));
  console.log(`📡 Testing DNS server at 127.0.0.1:${port}`);
  console.log(`🚫 Blocked response should be: ${blockResponse}`);
  console.log('='.repeat(40));

  // Test some blocked domains
  const blockedTests = ['facebook.com', 'youtube.com', 'twitter.com'];
  console.log('\n🚫 Testing BLOCKED domains:');
  console.log('-'.repeat(30));

  for (const domain of blockedTests) {
    try {
      await testDomain(domain);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  // Test some allowed domains
  const allowedTests = ['google.com', 'github.com', 'nodejs.org'];
  console.log('\n✅ Testing ALLOWED domains:');
  console.log('-'.repeat(30));

  for (const domain of allowedTests) {
    try {
      await testDomain(domain);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n🎯 Test completed!');
}

// Run tests
runTests().catch(console.error);