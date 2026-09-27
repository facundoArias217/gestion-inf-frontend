import { AuthProvider } from '../context/auth-context';

export default function Providers({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
