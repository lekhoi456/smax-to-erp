# Smax to ERP Integration

A Svelte application that integrates SmaxAI with ERP systems, allowing seamless transfer of customer data and lead management.

## Features

- **Customer Data Integration**: Automatically captures and displays customer information from SmaxAI
- **Rich Text Editor**: Enhanced note-taking capabilities with TinyMCE
- **Date & Time Selection**: User-friendly date and time pickers
- **Debug Panel**: Real-time monitoring of data flow and messages
- **Responsive Design**: Works seamlessly across all device sizes
- **Modern UI**: Clean and intuitive interface with Bootstrap styling

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/smax-to-erp-svelte.git
cd smax-to-erp-svelte
```

2. Install dependencies:
```bash
npm install
```

## Development

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:5173
```

## Production Build

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Project Structure

```
smax-to-erp-svelte/
├── src/
│   ├── components/
│   │   ├── App.svelte
│   │   ├── Form.svelte
│   │   └── DebugPanel.svelte
│   ├── lib/
│   │   ├── api.js
│   │   ├── tinymce.js
│   │   └── datepicker.js
│   ├── main.js
│   ├── global.css
│   └── App.svelte
├── public/
│   └── favicon.png
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Dependencies

- **Svelte**: Frontend framework
- **Bootstrap**: UI components and styling
- **TinyMCE**: Rich text editor
- **Bootstrap Datepicker**: Date and time selection
- **Bootstrap Icons**: Icon set

## API Integration

The application communicates with the backend through the following endpoints:

- `POST /api/webhook/smax-to-erp`: Creates a new lead in the ERP system

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_API_BASE_URL=http://localhost:3000
```

## Security

The application implements several security measures:

- Content Security Policy (CSP)
- XSS Protection
- Frame Protection
- MIME Type Sniffing Prevention

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@example.com or create an issue in the repository. 