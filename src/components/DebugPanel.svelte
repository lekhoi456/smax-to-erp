<script lang="ts">
  import { customerData } from '../stores/customerStore';
</script>

<div class="debug-panel">
  <h6 class="mb-3">Customer Data:</h6>
  <pre class="json-code">
    {JSON.stringify($customerData, null, 2)}
  </pre>
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
</style> 