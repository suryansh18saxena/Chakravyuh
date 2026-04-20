import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    this.setState({ error, info });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'red', background: 'black', padding: '2rem', height: '100vh', whiteSpace: 'pre-wrap', zIndex: 9999, position: 'relative' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>REACT CRASHED</h1>
          <p>{this.state.error && this.state.error.message}</p>
          <pre style={{ fontSize: '12px', marginTop: '1rem', color: 'pink' }}>{this.state.error && this.state.error.stack}</pre>
          <pre style={{ fontSize: '12px', marginTop: '1rem', color: 'yellow' }}>{this.state.info && this.state.info.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </StrictMode>,
)

