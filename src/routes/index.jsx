import { createFileRoute } from '@tanstack/react-router'


import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import HeroSection from '@/components/home/HeroSection'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <main className="flex flex-col items-center justify-center w-full text-center max-w-[1440px] mx-auto ">
        <HeroSection/>
        <div className="max-w-3xl pt-8">
          <h2 className="text-4xl font-extrabold text-primary sm:text-5xl md:text-6xl">
            Your Trusted Partner in Real Estate
          </h2>
          <p className="mt-4 text-xl text-muted-foreground">
            We specialize in marketing land files, housing society projects, and much more.
          </p>
        </div>

        <Card className="w-full max-w-md mt-12">
          <CardHeader>
            <CardTitle>Coming Soon!</CardTitle>
            <CardDescription>Our new website is under construction.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We are working hard to bring you an amazing online experience. Stay tuned for our launch.
            </p>
            <Button className="w-full mt-6">Notify Me</Button>
          </CardContent>
        </Card>

        <div className="flex flex-wrap justify-center gap-4 mt-12">
          <Button variant="default">Default Button</Button>
          <Button variant="destructive">Destructive Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="link">Link Button</Button>
        </div>

      </main>
}
