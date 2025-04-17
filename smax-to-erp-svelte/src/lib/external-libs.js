// Function to load external script
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Function to load external stylesheet
function loadStyle(href) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });
}

// Load all required external libraries
export async function loadExternalLibraries() {
  try {
    // Load CSS files first
    await Promise.all([
      loadStyle('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css'),
      loadStyle('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css'),
      loadStyle('https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.9.0/css/bootstrap-datepicker.min.css'),
      loadStyle('https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.2.0/skins/ui/oxide/skin.min.css'),
      loadStyle('https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.2.0/skins/ui/oxide/content.min.css'),
      loadStyle('https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.2.0/skins/content/default/content.min.css')
    ]);

    // Load jQuery first as it's required by Bootstrap and Datepicker
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js');

    // Load Bootstrap JS and Datepicker after jQuery
    await Promise.all([
      loadScript('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js'),
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.9.0/js/bootstrap-datepicker.min.js'),
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.9.0/locales/bootstrap-datepicker.vi.min.js')
    ]);

    // Load TinyMCE and its resources
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.2.0/tinymce.min.js');
    await Promise.all([
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.2.0/icons/default/icons.min.js'),
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.2.0/themes/silver/theme.min.js'),
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.2.0/models/dom/model.min.js')
    ]);

    return true;
  } catch (error) {
    console.error('Error loading external libraries:', error);
    return false;
  }
} 