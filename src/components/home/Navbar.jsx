import { Link } from '@tanstack/react-router'
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

const Navbar = () => {
  return (
    <header className="fixed w-full mx-auto -translate-x-1/2 rounded-full shadow-md z-2 bg-card text-card-foreground max-w-7xl top-4 left-1/2">
            <nav className="flex items-center justify-between w-full px-4 py-4">
              <h1 className="text-2xl font-bold text-primary">The Zalmi Marketing</h1>
              <Link to="/about" >About</Link>
              <Button variant="outline" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </nav>
    </header>
  )
}

export default Navbar;