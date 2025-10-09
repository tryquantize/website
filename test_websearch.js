#!/usr/bin/env node

// Simple test to verify web search parameter is working
const fetch = require('node-fetch');

async function testWebSearch() {
  const AI_SERVICE_URL = 'http://localhost:5002';
  
  console.log('Testing web search functionality...\n');
  
  // Test 1: Web search disabled (should use RAG)
  console.log('Test 1: Web search disabled (should use RAG)');
  try {
    const response1 = await fetch(`${AI_SERVICE_URL}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'AI writing tools',
        webSearchEnabled: false,
        selectedTypes: [],
        selectedLocations: []
      })
    });
    
    const result1 = await response1.json();
    console.log('- Web search used:', result1.web_search_used);
    console.log('- RAG used:', result1.rag_used);
    console.log('- Model used:', result1.model_used);
    console.log('- Success:', result1.success);
    console.log('');
  } catch (error) {
    console.log('- Error:', error.message);
    console.log('');
  }
  
  // Test 2: Web search enabled (should use web search)
  console.log('Test 2: Web search enabled (should use web search)');
  try {
    const response2 = await fetch(`${AI_SERVICE_URL}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'AI writing tools',
        webSearchEnabled: true,
        selectedTypes: [],
        selectedLocations: []
      })
    });
    
    const result2 = await response2.json();
    console.log('- Web search used:', result2.web_search_used);
    console.log('- RAG used:', result2.rag_used);
    console.log('- Model used:', result2.model_used);
    console.log('- Success:', result2.success);
    console.log('');
  } catch (error) {
    console.log('- Error:', error.message);
    console.log('');
  }
}

testWebSearch().catch(console.error);