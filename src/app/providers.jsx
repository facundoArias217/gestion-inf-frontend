import { AuthProvider } from '../context/auth-context.jsx';

export default function Providers({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
