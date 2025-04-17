const API_BASE_URL = '/api';

/**
 * Create a new lead in the ERP system
 * @param {Object} leadData - The lead data to create
 * @returns {Promise<Object>} - The created lead data
 */
export async function createLead(leadData) {
  try {
    const response = await fetch(`${API_BASE_URL}/webhook/smax-to-erp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
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
    customer: {
      name: formData.customerName,
      phone: formData.customerPhone,
      email: formData.customerEmail,
      address: formData.customerAddress,
      avatar: formData.customerAvatar
    },
    erp: {
      code: formData.erpCode,
      name: formData.erpName,
      phone: formData.erpPhone,
      email: formData.erpEmail,
      address: formData.erpAddress,
      note: formData.erpNote,
      status: formData.erpStatus,
      source: formData.erpSource,
      date: formData.erpDate,
      time: formData.erpTime
    }
  };
} 