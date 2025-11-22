import { createFileRoute } from '@tanstack/react-router'
import { GlobalHero } from '@/components/home/GlobalHero'
export const Route = createFileRoute('/contact')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <GlobalHero>
          <h1 className='px-4 py-4 mx-auto text-4xl text-center rounded bg-muted w-fit'>Contact Us</h1>
      
        </GlobalHero>
  </div>
}
