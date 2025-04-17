import './global.css';
import App from './App.svelte';

// Import Bootstrap and its dependencies
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

const app = new App({
  target: document.getElementById('app'),
});

export default app; 