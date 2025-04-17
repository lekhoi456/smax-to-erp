import { writable } from 'svelte/store';

export interface CustomerData {
  id?: string;
  pid?: string;
  gid?: string;
  page_pid?: string;
  picture?: string;
  name?: string;
  birthdate?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  erp_id?: string;
  erp_unique_id?: string;
  adult?: number;
  children?: number;
  departure_date?: string;
  return_date?: string;
  type?: string;
  ticket_name?: string;
  ticket_description?: string;
  ticket_priority?: string;
  pic?: string;
}

export const customerData = writable<CustomerData>({});

// Listen for messages from SmaxAi Livechat
if (typeof window !== 'undefined') {
  window.addEventListener('message', (event) => {
    if (typeof event.data === 'object' && event.data.name === '__SM_FORM_CUSTOMER') {
      const customer = event.data?.data?.customer;
      if (customer) {
        customerData.set(customer);
      }
    }
  });
} 