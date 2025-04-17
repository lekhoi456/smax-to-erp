import { get } from 'svelte/store';
import { customerData } from '../stores/customerStore';

export function initializeFormComponents() {
  // Initialize datepickers
  $('.datepicker').datepicker({
    format: 'dd/mm/yyyy',
    autoclose: true,
    todayHighlight: true,
    language: 'vi',
    orientation: 'bottom auto'
  });

  // Set default dates if not set
  const today = new Date();
  const formattedDate = today.getDate().toString().padStart(2, '0') + '/' + 
                        (today.getMonth() + 1).toString().padStart(2, '0') + '/' + 
                        today.getFullYear();

  if (!document.getElementById('departure_date')?.value) {
    document.getElementById('departure_date')?.setAttribute('value', formattedDate);
  }

  if (!document.getElementById('return_date')?.value) {
    const returnDate = new Date();
    returnDate.setDate(today.getDate() + 3);
    const formattedReturnDate = returnDate.getDate().toString().padStart(2, '0') + '/' + 
                              (returnDate.getMonth() + 1).toString().padStart(2, '0') + '/' + 
                              returnDate.getFullYear();
    document.getElementById('return_date')?.setAttribute('value', formattedReturnDate);
  }

  // Initialize TinyMCE
  if (!tinymce.get('ticket_description')) {
    tinymce.init({
      selector: '#ticket_description',
      height: 150,
      menubar: false,
      plugins: 'link lists table',
      toolbar_items_size: 'small',
      toolbar: 'undo redo | bold italic | alignleft aligncenter | bullist numlist | link',
      content_style: 'body { font-family: "Roboto", sans-serif; font-size: 13px; } .mce-btn button { padding: 2px 4px !important; } .mce-btn-small button { padding: 1px 3px !important; }',
      branding: false,
      promotion: false,
      statusbar: false,
      resize: false,
      toolbar_location: 'top',
      forced_root_block: 'p',
      toolbar_mode: 'wrap',
      icons: 'small'
    });
  }
}

export function validateForm(isERPSubmit = false): boolean {
  let isValid = true;
  const customer = get(customerData);

  // Validate name
  if (!customer.name?.trim()) {
    document.getElementById('name-error')?.style.setProperty('display', 'block');
    isValid = false;
  } else {
    document.getElementById('name-error')?.style.setProperty('display', 'none');
  }

  // Validate phone if provided
  if (customer.phone?.trim()) {
    const phonePattern = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    if (!phonePattern.test(customer.phone)) {
      document.getElementById('phone-error')?.style.setProperty('display', 'block');
      isValid = false;
    } else {
      document.getElementById('phone-error')?.style.setProperty('display', 'none');
    }
  }

  // Validate email if provided
  if (customer.email?.trim()) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(customer.email)) {
      document.getElementById('email-error')?.style.setProperty('display', 'block');
      isValid = false;
    } else {
      document.getElementById('email-error')?.style.setProperty('display', 'none');
    }
  }

  // Validate ERP specific fields
  if (isERPSubmit) {
    if (!customer.ticket_name?.trim()) {
      document.getElementById('ticket_name-error')?.style.setProperty('display', 'block');
      isValid = false;
    } else {
      document.getElementById('ticket_name-error')?.style.setProperty('display', 'none');
    }

    if (!customer.pic) {
      document.getElementById('pic-error')?.style.setProperty('display', 'block');
      isValid = false;
    } else {
      document.getElementById('pic-error')?.style.setProperty('display', 'none');
    }
  }

  return isValid;
}

export async function submitToERP(): Promise<{ success: boolean; message: string; leadId?: string }> {
  const customer = get(customerData);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch('https://n8n.nucuoimekong.com/webhook/smax-to-erp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(customer),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const data = await response.json();

    if (data && data[0]?.success === true && data[0]?.data?.code) {
      const codeMatch = data[0].data.code.match(/\D*(\d+)/);
      const leadId = codeMatch ? codeMatch[1] : '';
      
      if (leadId) {
        return {
          success: true,
          message: `Đã thêm lead #${leadId}`,
          leadId
        };
      }
      
      return {
        success: true,
        message: `Đã thêm lead thành công: ${data[0].data.code}`
      };
    }

    return {
      success: false,
      message: 'Không nhận được phản hồi từ ERP. Vui lòng thử lại.'
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        message: 'Máy chủ ERP đang xử lý quá lâu. Vui lòng kiểm tra sau vài phút.'
      };
    }
    
    return {
      success: false,
      message: 'Không thể kết nối đến máy chủ ERP. Vui lòng thử lại.'
    };
  }
} 