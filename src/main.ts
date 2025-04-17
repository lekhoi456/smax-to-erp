import App from './App.svelte';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap-datepicker/dist/css/bootstrap-datepicker.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-datepicker/dist/js/bootstrap-datepicker.min.js';
import 'bootstrap-datepicker/dist/locales/bootstrap-datepicker.vi.min.js';
import 'tinymce/tinymce.min.js';

const app = new App({
  target: document.getElementById('app')!,
});

export default app; 