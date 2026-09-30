import Providers from './app/providers'
import Router from './app/router'
import { Toaster } from './components/ui/sonner'

function App() {
  return (
    <Providers>
      <Router />
      <Toaster />
    </Providers>
  )
}

export default App
