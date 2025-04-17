<script>
  import { onMount } from 'svelte';
  
  export let customerData = null;
  
  let isOpen = false;
  let messages = [];
  
  onMount(() => {
    // Listen for SmaxAI messages
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  });
  
  function handleMessage(event) {
    if (typeof event.data === 'object') {
      messages = [...messages, {
        timestamp: new Date().toISOString(),
        data: event.data
      }].slice(-10); // Keep last 10 messages
    }
  }
  
  function togglePanel() {
    isOpen = !isOpen;
  }
  
  function clearMessages() {
    messages = [];
  }
</script>

<div class="debug-panel">
  <h6 class="mb-3">Customer Data:</h6>
  <pre class="json-code">{customerData ? JSON.stringify(customerData, null, 2) : 'Waiting for customer data...'}</pre>
</div>

<style>
  .debug-panel {
    width: 100%;
    max-width: 400px;
    margin: 15px auto;
    background-color: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  
  .json-code {
    background-color: #272822;
    color: #f8f8f2;
    border-radius: 4px;
    padding: 10px;
    font-family: 'Courier New', monospace;
    overflow-x: auto;
    white-space: pre;
    font-size: 12px;
    max-height: 150px;
    overflow-y: auto;
  }
  
  h6 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
  }
</style> 