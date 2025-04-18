<script>
  import { onMount } from 'svelte';

  const NOCODB_API_URL = 'https://nocodb.mykdigi.com/api/v2/tables/meptiucn6e8bsj2/records';
  const NOCODB_TOKEN = '0mr-zizuLunUdT4ZslPAQfT1du-gguqRGZrU2RS4';
  const ERP_API_URL = 'https://erp.nucuoimekong.vn/api/v1';
  const ERP_API_TOKEN = 'W45PJABnxYXd7PPVPrbdgGwrUENYBL4S35ttutP_1699315050';

  const CUSTOMER_TYPE_COLORS = {
    "Prospect": "#3498db",
    "Engaging": "#34495e",
    "Opportunity": "#29bbdb",
    "In progress": "#29bbdb",
    "Active": "#2ecc71",
    "Reactivated": "#9b59b6",
    "Loyal": "#29bbdb",
    "Envangelist": "#29bbdb",
    "Closed Lost": "#e74c3c",
    "Inactive": "#29bbdb",
    "Churned": "#95a5a6",
    "Đã liên hệ": "#1abc9c"
  };

  let loading = true;
  let error = null;
  let noData = false;
  let leads = [];

  // Get integration ID from URL
  const getIntegrationId = () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('integration_id');
    }
    return null;
  };

  // Request customer data from SMAX
  function requestSmaxData() {
    if (typeof window !== 'undefined' && window.parent) {
      const integrationId = getIntegrationId();
      console.log('Requesting SMAX data with integration_id:', integrationId);
      
      window.parent.postMessage({
        name: '__SM_FORM_CUSTOMER',
        data: {
          integration_id: integrationId
        }
      }, '*');
    }
  }

  async function getLeadsBySmaxId(smaxId) {
    console.log('Fetching leads for SMAX ID:', smaxId);
    try {
      const url = `${NOCODB_API_URL}?viewId=vw8qpktzg3g4qana&where=(smax_id,eq,${smaxId})&limit=25&shuffle=0&offset=0`;
      console.log('NocoDB URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'accept': 'application/json',
          'xc-token': NOCODB_TOKEN
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('NocoDB Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('NocoDB response:', data);
      return data.list || [];
    } catch (error) {
      console.error('Error in getLeadsBySmaxId:', error);
      throw error;
    }
  }

  async function getLeadFromERP(leadId) {
    console.log('Fetching lead from ERP:', leadId);
    try {
      const url = `${ERP_API_URL}/leads/${leadId}`;
      console.log('ERP Lead URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${ERP_API_TOKEN}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ERP Lead Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('ERP Lead response:', data);
      return data.data || null;
    } catch (error) {
      console.error('Error in getLeadFromERP:', error);
      throw error;
    }
  }

  async function getCustomerFromERP(customerId) {
    console.log('Fetching customer from ERP:', customerId);
    try {
      const url = `${ERP_API_URL}/customers/${customerId}`;
      console.log('ERP Customer URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${ERP_API_TOKEN}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ERP Customer Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('ERP Customer response:', data);
      return data.data || null;
    } catch (error) {
      console.error('Error in getCustomerFromERP:', error);
      throw error;
    }
  }

  async function loadLeads(smaxId) {
    try {
      loading = true;
      error = null;
      noData = false;

      if (!smaxId) {
        throw new Error('SMAX ID is required');
      }

      console.log('Starting to load leads for SMAX ID:', smaxId);

      // Get leads from NocoDB
      const nocoLeads = await getLeadsBySmaxId(smaxId);
      console.log('NocoDB leads found:', nocoLeads);
      
      if (nocoLeads.length === 0) {
        console.log('No leads found in NocoDB');
        noData = true;
        return;
      }

      // Get lead details from ERP for each lead
      const detailedLeads = await Promise.all(
        nocoLeads.map(async (nocoLead) => {
          if (!nocoLead.erp_lead_id) {
            console.warn('No ERP lead ID found for NocoDB lead:', nocoLead);
            return null;
          }
          console.log('Fetching ERP lead for ID:', nocoLead.erp_lead_id);
          const erpLead = await getLeadFromERP(nocoLead.erp_lead_id);
          
          if (!erpLead || !erpLead.customer) {
            return null;
          }

          // Get customer details
          console.log('Fetching customer details for ID:', erpLead.customer.id);
          const customer = await getCustomerFromERP(erpLead.customer.id);
          
          if (!customer) {
            return null;
          }

          return {
            ...nocoLead,
            ...erpLead,
            customer: {
              ...erpLead.customer,
              ...customer
            }
          };
        })
      );

      // Filter out null leads
      leads = detailedLeads.filter(lead => lead !== null);
      console.log('Valid leads after filtering:', leads);
      
      if (leads.length === 0) {
        console.log('No valid leads after filtering');
        noData = true;
      }

    } catch (err) {
      console.error('Error loading leads:', err);
      error = err.message;
    } finally {
      loading = false;
    }
  }

  // Handle SMAX message
  function handleSmaxMessage(event) {
    console.log('Received message from SMAX:', event.data);
    if (event.data?.name === '__SM_FORM_CUSTOMER' && event.data?.data?.customer?.id) {
      const smaxId = event.data.data.customer.id;
      console.log('Processing SMAX customer ID:', smaxId);
      loadLeads(smaxId);
    }
  }

  onMount(() => {
    console.log('List Lead component mounted');
    
    // Listen for messages from SMAX
    window.addEventListener('message', handleSmaxMessage);
    
    // Auto request data when page loads
    requestSmaxData();

    return () => {
      // Cleanup event listener
      window.removeEventListener('message', handleSmaxMessage);
    };
  });
</script>

<svelte:head>
  <title>Danh sách Lead</title>
</svelte:head>

<div id="leads-content">
  {#if loading}
    <div class="text-center">
      <span class="loading"></span> Đang tải...
    </div>
  {/if}
  
  {#if error}
    <div class="alert alert-danger">
      <i class="bi bi-exclamation-triangle"></i> {error}
    </div>
  {/if}
  
  {#if noData}
    <div class="alert alert-info">
      <i class="bi bi-info-circle"></i> Không tìm thấy lead nào.
    </div>
  {/if}
  
  <div id="leads-container">
    {#each leads as lead}
      <div class="lead-card">
        <div class="lead-header">
          <div class="lead-code">
            <a href={lead.link_erp} target="_blank">{lead.code}</a>
            <span class="lead-date ms-2"><i class="bi bi-calendar"></i> {lead.created_at}</span>
          </div>
          <div class="lead-status">
            <span class="state-badge" data-color={lead.state.color}>
              {lead.state.title}
            </span>
          </div>
        </div>
        <div class="lead-body">
          <div class="lead-info">
            <div class="lead-customer">
              <div class="customer-name">
                <a href={lead.customer.link_erp} target="_blank">{lead.customer.name}</a>
              </div>
              <div class="customer-meta">
                <span><i class="bi bi-telephone"></i> {lead.customer.phone?.primary?.number || 'N/A'}</span>
                {#if lead.customer.type}
                  <span class="customer-type" style={lead.customer.type ? `background-color: ${CUSTOMER_TYPE_COLORS[lead.customer.type] || '#6c757d'}; color: white;` : ''}>
                    {lead.customer.type}
                  </span>
                {/if}
              </div>
            </div>
            <div class="lead-service">
              {@html lead.service || ''}
            </div>
            {#if lead.note}
              <div class="lead-note">
                {@html lead.note}
              </div>
            {/if}
          </div>
        </div>
        <div class="lead-footer">
          <div class="lead-meta">
            <span><i class="bi bi-person-badge"></i> {lead.sales_person.name}</span>
          </div>
          <div class="lead-actions">
            <button 
              class="btn btn-primary btn-sm"
              on:click={() => window.open(`https://erp.nucuoimekong.vn/admin/order/create?lead_id=${lead.id}`, '_blank')}
            >
              <i class="bi bi-plus-circle"></i> Tạo đơn
            </button>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .loading {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .state-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1.2;
  }
  /* State colors */
  .state-badge[data-color="#ffc84b"] {
    background-color: rgba(255, 200, 75, 0.2);
    color: #ffc84b;
  }
  .state-badge[data-color="#28a745"] {
    background-color: rgba(40, 167, 69, 0.2);
    color: #28a745;
  }
  .state-badge[data-color="#dc3545"] {
    background-color: rgba(220, 53, 69, 0.2);
    color: #dc3545;
  }
  .state-badge[data-color="#17a2b8"] {
    background-color: rgba(23, 162, 184, 0.2);
    color: #17a2b8;
  }
  .state-badge[data-color="#6c757d"] {
    background-color: rgba(108, 117, 125, 0.2);
    color: #6c757d;
  }

  /* Card styles */
  .lead-card {
    border: 1px solid #e9ecef;
    border-radius: 0.75rem;
    margin-bottom: 1rem;
    transition: all 0.2s ease;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }
  .lead-card:hover {
    box-shadow: 0 0.25rem 0.75rem rgba(0,0,0,0.08);
    border-color: #dee2e6;
  }
  .lead-header {
    background-color: #f8f9fa;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 0.75rem 0.75rem 0 0;
  }
  .lead-code {
    font-weight: 600;
    color: #495057;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .lead-code a {
    color: #228be6;
    text-decoration: none;
  }
  .lead-code a:hover {
    color: #1971c2;
    text-decoration: underline;
  }
  .lead-status {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  .lead-body {
    padding: 0.875rem 1rem;
    background: #fff;
  }
  .lead-info {
    margin-bottom: 0.75rem;
  }
  .lead-customer {
    margin-bottom: 0.75rem;
  }
  .customer-name {
    font-weight: 600;
    margin-bottom: 0.375rem;
    font-size: 0.875rem;
  }
  .customer-name a {
    color: #228be6;
    text-decoration: none;
  }
  .customer-name a:hover {
    color: #1971c2;
    text-decoration: underline;
  }
  .customer-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.75rem;
    color: #868e96;
    align-items: center;
  }
  .customer-type {
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 500;
  }
  .lead-service {
    font-weight: 500;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    color: #495057;
    line-height: 1.4;
  }
  .lead-note {
    font-size: 0.75rem;
    color: #868e96;
    margin-top: 0.5rem;
    line-height: 1.4;
  }
  .lead-note :global(ul), .lead-service :global(ul) {
    padding-left: 1.5rem;
    margin-bottom: 0.5rem;
  }
  .lead-note :global(a), .lead-service :global(a) {
    color: #228be6;
    text-decoration: none;
  }
  .lead-note :global(a:hover), .lead-service :global(a:hover) {
    text-decoration: underline;
  }
  .lead-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background-color: #f8f9fa;
    border-top: 1px solid #e9ecef;
    border-radius: 0 0 0.75rem 0.75rem;
  }
  .lead-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.75rem;
    color: #868e96;
    align-items: center;
  }
  .lead-meta i {
    font-size: 0.875rem;
  }
  .lead-actions {
    display: flex;
    gap: 0.5rem;
  }
  .btn-sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
    border-radius: 0.375rem;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
  }
  .btn-sm i {
    font-size: 0.875rem;
  }
  #leads-content {
    padding: 1rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  @media (min-width: 768px) {
    #leads-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1rem;
    }
    .lead-card {
      margin: 0;
    }
  }
  .lead-date {
    font-size: 0.65rem;
    color: #adb5bd;
    font-weight: normal;
    white-space: nowrap;
  }
  .lead-date i {
    font-size: 0.65rem;
  }
  .btn-primary {
    background-color: #228be6;
    border-color: #228be6;
  }
  .btn-primary:hover {
    background-color: #1971c2;
    border-color: #1971c2;
  }
</style> 