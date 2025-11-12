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
const { port, upstreamDNS, blockResponse, logLevel } = settings;

// Convert blocked domains to lowercase for case-insensitive matching
const blockedSet = new Set(blockedDomains.map(domain => domain.toLowerCase()));

// Create DNS server using dgram (correct approach)
const socket = dgram.createSocket('udp4');

// DNS packet utilities
function createDNSResponse(request, answers = []) {
  const packet = Buffer.alloc(512); // Maximum DNS packet size

  // Simple DNS response structure
  // This is a basic implementation - in production you'd use a proper DNS library
  return packet;
}

// Logging function
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const shouldLog = logLevel === 'debug' ||
                   (logLevel === 'info' && level !== 'debug') ||
                   (logLevel === 'warn' && ['warn', 'error'].includes(level)) ||
                   (logLevel === 'error' && level === 'error');

  if (shouldLog) {
    console.log(`[${timestamp}] ${message}`);
  }
}

// Check if domain is blocked
function isBlocked(domain) {
  if (!domain) return false;

  const lowerDomain = domain.toLowerCase();

  // Check exact match
  if (blockedSet.has(lowerDomain)) {
    return true;
  }

  // Check subdomains
  for (const blockedDomain of blockedSet) {
    if (lowerDomain === blockedDomain || lowerDomain.endsWith('.' + blockedDomain)) {
      return true;
    }
  }

  return false;
}

// Handle DNS requests
socket.on('message', (msg, rinfo) => {
  log(`🔍 Received DNS query from ${rinfo.address}:${rinfo.port} (${msg.length} bytes)`, 'debug');

  // For simplicity, we'll use the dns2 package to parse and create responses
  try {
    const request = dns.Packet.parse(msg);
    const question = request.questions[0];
    const domain = question.name;
    const type = question.type;

    log(`🔍 DNS Query: ${domain} (${type})`, 'info');

    const response = new dns.Packet();

    // Copy request header info
    response.id = request.id;
    response.questions = request.questions;
    response.rd = request.rd; // Recursion desired
    response.ra = true; // Recursion available
    response.qr = 1; // This is a response

    if (type === 'A') {
      if (isBlocked(domain)) {
        log(`🚫 BLOCKED: ${domain} -> ${blockResponse}`, 'info');

        // Add blocked response
        response.answers.push({
          name: domain,
          type: 'A',
          class: 'IN',
          ttl: 300,
          address: blockResponse
        });

        const responseBuffer = response.toBuffer();
        socket.send(responseBuffer, rinfo.port, rinfo.address);
        log(`📤 Sent blocked response to ${rinfo.address}:${rinfo.port}`, 'debug');

      } else {
        log(`✅ ALLOWED: ${domain}`, 'debug');

        // For testing, we'll just resolve using Node's built-in DNS
        // In production, you'd forward to the upstream DNS server
        require('dns').lookup(domain, (err, address, family) => {
          const finalResponse = new dns.Packet();
          finalResponse.id = request.id;
          finalResponse.questions = request.questions;
          finalResponse.rd = request.rd;
          finalResponse.ra = true;
          finalResponse.qr = 1;

          if (err) {
            log(`❌ Error resolving ${domain}: ${err.message}`, 'error');
            finalResponse.answers.push({
              name: domain,
              type: 'A',
              class: 'IN',
              ttl: 60,
              address: '0.0.0.0'
            });
          } else {
            log(`🌐 RESOLVED: ${domain} -> ${address}`, 'info');
            finalResponse.answers.push({
              name: domain,
              type: 'A',
              class: 'IN',
              ttl: 300,
              address: address
            });
          }

          const responseBuffer = finalResponse.toBuffer();
          socket.send(responseBuffer, rinfo.port, rinfo.address);
          log(`📤 Sent resolved response to ${rinfo.address}:${rinfo.port}`, 'debug');
        });
        return; // Don't send response yet - wait for lookup
      }
    } else {
      // Non-A queries - send empty response
      const responseBuffer = response.toBuffer();
      socket.send(responseBuffer, rinfo.port, rinfo.address);
    }

  } catch (error) {
    log(`❌ Error parsing DNS request: ${error.message}`, 'error');
    // Send empty response on error
    const errorResponse = new dns.Packet();
    errorResponse.id = 1234; // Default ID if parsing failed
    errorResponse.qr = 1; // Response flag
    errorResponse.rcode = 2; // Server failure
    const errorBuffer = errorResponse.toBuffer();
    socket.send(errorBuffer, rinfo.port, rinfo.address);
  }
});

// Handle server errors
socket.on('error', (err) => {
  log(`❌ Server error: ${err.message}`, 'error');
});

// Handle process shutdown
function shutdown() {
  log('🛑 Shutting down DNS server...', 'info');
  socket.close(() => {
    log('✅ DNS server stopped', 'info');
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start server
socket.on('listening', () => {
  const address = socket.address();
  log(`🚀 DNS Blocking Server started`, 'info');
  log(`   📍 Listening on ${address.address}:${address.port}`, 'info');
  log(`   🚫 Blocking ${blockedDomains.length} domains`, 'info');
  log(`   🔄 Upstream DNS: ${upstreamDNS}`, 'info');
  log(`   ⏹️  Blocked domains respond with: ${blockResponse}`, 'info');
  log('', 'info');
  log(`📋 Blocked domains:`, 'info');
  blockedDomains.forEach(domain => {
    log(`   - ${domain}`, 'info');
  });
  log('', 'info');
  log(`💡 Test with: node test-dns.js`, 'info');
  log(`   Or: nslookup facebook.com 127.0.0.1 5353`, 'info');
  log('', 'info');
  log('Press Ctrl+C to stop', 'info');
});

// Start the server
try {
  socket.bind(port, '127.0.0.1');
} catch (error) {
  console.error('❌ Failed to start DNS server:', error.message);
  process.exit(1);
}