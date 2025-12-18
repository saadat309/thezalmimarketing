import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Home, Search, AlertCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col py-25 items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 scale-150 rounded-full blur-2xl bg-primary/20 animate-pulse"></div>
        <AlertCircle className="relative w-24 h-24 text-primary" strokeWidth={1.5} />
      </div>
      
      <h1 className="mb-2 text-6xl font-extrabold text-primary">404</h1>
      <h2 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">Page Not Found</h2>
      
      <p className="max-w-md mb-10 text-muted-foreground">
        Oops! The page you are looking for doesn't exist or has been moved. 
        Don't worry, even the best travelers get lost sometimes.
      </p>
      
      <div className="flex flex-col gap-4 sm:flex-row">
        <Button asChild size="lg" className="gap-2">
          <Link to="/">
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="gap-2">
          <Link to="/properties">
            <Search className="w-4 h-4" />
            Search Properties
          </Link>
        </Button>
      </div>
    </div>
  )
}
