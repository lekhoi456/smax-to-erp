const WEBHOOK_URL = 'https://n8n.nucuoimekong.com/webhook/smax-to-erp';
const NOCODB_API_URL = 'https://nocodb.mykdigi.com/api/v2/tables/meptiucn6e8bsj2/records';
const NOCODB_TOKEN = '0mr-zizuLunUdT4ZslPAQfT1du-gguqRGZrU2RS4';
const ERP_API_URL = 'https://erp.nucuoimekong.vn/api/v1/leads';
const ERP_API_TOKEN = 'W45PJABnxYXd7PPVPrbdgGwrUENYBL4S35ttutP_1699315050';

/**
 * Create a new lead in the ERP system
 * @param {Object} leadData - The lead data to create
 * @returns {Promise<Object>} - The created lead data
 */
export async function createLead(leadData) {
  try {
    // Clean and validate the data before sending
    const cleanedData = {
      id: leadData.id || '',
      pid: leadData.pid || '',
      gid: leadData.gid || '',
      page_pid: leadData.page_pid || '',
      picture: leadData.picture || '',
      name: leadData.name || '',
      birthdate: leadData.birthdate || '',
      gender: leadData.gender || '',
      phone: leadData.phone || '',
      email: leadData.email || '',
      address: leadData.address || '',
      departure_date: leadData.departure_date || '',
      return_date: leadData.return_date || '',
      adult: leadData.adult || '',
      children: leadData.children || '',
      erp_id: leadData.erp_id || '',
      erp_unique_id: leadData.erp_unique_id || '',
      type: leadData.type || '',
      ticket_priority: leadData.ticket_priority || 'normal',
      ticket_name: leadData.ticket_name || '',
      pic: leadData.pic || '',
      ticket_description: leadData.ticket_description || ''
    };

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanedData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const rawData = await response.text();
    let data;
    try {
      data = JSON.parse(rawData);
    } catch (e) {
      console.error('Error parsing response:', e);
      throw new Error('Invalid JSON response from server');
    }

    // If data is wrapped in an array, take the first item
    if (Array.isArray(data)) {
      return data[0];
    }

    return data;
  } catch (error) {
    console.error('Error creating lead:', error);
    throw error;
  }
}

/**
 * Format lead data for ERP system
 * @param {Object} formData - The form data to format
 * @returns {Object} - The formatted lead data
 */
export function formatLeadData(formData) {
  return {
    id: formData.id,
    pid: formData.pid,
    gid: formData.gid,
    page_pid: formData.page_pid,
    picture: formData.picture,
    name: formData.name,
    birthdate: formData.birthdate,
    gender: formData.gender,
    phone: formData.phone,
    email: formData.email,
    address: formData.address,
    departure_date: formData.departure_date,
    return_date: formData.return_date,
    adult: formData.adult,
    children: formData.children,
    erp_id: formData.erp_id,
    erp_unique_id: formData.erp_unique_id,
    type: formData.type,
    ticket_priority: formData.ticket_priority,
    ticket_name: formData.ticket_name,
    pic: formData.pic,
    ticket_description: formData.ticket_description
  };
}

/**
 * Get leads by SMAX ID from NocoDB
 * @param {string} smaxId - The SMAX ID to search for
 * @returns {Promise<Array>} - Array of lead records
 */
export async function getLeadsBySmaxId(smaxId) {
  try {
    const response = await fetch(`${NOCODB_API_URL}?viewId=vw8qpktzg3g4qana&where=(smax_%20id,eq,${smaxId})&limit=25&shuffle=0&offset=0`, {
      headers: {
        'accept': 'application/json',
        'xc-token': NOCODB_TOKEN
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.list || [];
  } catch (error) {
    console.error('Error fetching leads from NocoDB:', error);
    throw error;
  }
}

/**
 * Get lead details from ERP by lead code
 * @param {string} leadCode - The lead code (e.g. LU13446)
 * @returns {Promise<Object>} - Lead details
 */
export async function getLeadFromERP(leadCode) {
  try {
    const response = await fetch(`${ERP_API_URL}?api_token=${ERP_API_TOKEN}&code=${leadCode}`, {
      headers: {
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.[0] || null;
  } catch (error) {
    console.error('Error fetching lead from ERP:', error);
    throw error;
  }
} 