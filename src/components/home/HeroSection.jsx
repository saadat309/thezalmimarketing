// import React from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { Search, Building, Home, Warehouse } from 'lucide-react';

// const HeroSection = () => {
//   return (
//      <section className="w-full">
//       <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
//         {/* background layer (preserves 16:9) */}
//         <div
//           className="absolute inset-0 bg-center bg-cover"
//           style={{ backgroundImage: `url('/lahore-city-pic.webp')` }}
//           aria-hidden
//         />
        
//         {/* content layer */}
//         <div className="absolute inset-0 flex items-center justify-center px-4">
      
//           <div className="flex flex-col items-center justify-center gap-4 p-8 z-2 tex4t-center backdrop-blur-sm rounded-2xl">
//             <Badge
//               variant="outline"
//               className="p-2 text-sm rounded-full text-primary bg-white/40 backdrop-blur-sm border-ring"
//             >
//               LET US GUIDE YOUR HOME
//             </Badge>
//             <h1 className="text-4xl font-bold text-primary md:text-6xl">
//               Believe in finding it
//             </h1>
//             <p className="text-lg text-primary md:text-xl">
//               Search properties for sale and to rent in the UK
//             </p>

//             <div className="w-full max-w-xl mt-4">
//               <div className="relative grow">
//                 <Input
//                   type="text"
//                   placeholder="Enter Name, Keywords..."
//                   className="w-full p-6 pr-8 rounded-full bg-background "
//                 />
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   className="absolute p-5 -translate-y-1/2 rounded-full right-2 bg-muted top-1/2"
//                 >
//                   <Search className="size-6" />
//                 </Button>
//               </div>
//             </div>

//             <div className="flex flex-col items-center justify-center gap-4 mt-4 md:flex-row">
//               <div className="flex flex-wrap justify-center gap-2">
//                 <Button  variant='outline' className="p-2 pl-0 rounded-full bg-white/40 backdrop-blur-sm">
//                 <div className="p-2 mr-1 rounded-full bg-muted">
//                   <Home />
//                 </div>
//                   Modern Villa
//                 </Button>
//                 <Button  variant='outline' className="p-2 pl-0 rounded-full bg-white/40 backdrop-blur-sm ">
//                 <div className="p-2 mr-1 rounded-full bg-muted">
//                   <Building/>
//                 </div>
//                   Apartment
//                 </Button>
//                 <Button  variant='outline' className="p-2 pl-0 rounded-full bg-white/40 backdrop-blur-sm ">
//                 <div className="p-2 mr-1 rounded-full bg-muted">
//                   <Warehouse/>
//                 </div>
//                   Town House
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default HeroSection;

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Building, Home, Warehouse } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative w-full h-screen">
      {/* background image (fills the section) */}
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: `radial-gradient(at center, rgba(0, 0, 0, 0.3) 90%, rgba(0, 0, 0, 0.5) 100%), url('/lahore-city-pic.webp')` }}
        aria-hidden
      />

      {/* whitish overlay to improve readability */}
      {/* <div className="absolute inset-0 bg-white opacity-20 " aria-hidden /> */}

      {/* content container — fills section height */}
      <div className="relative z-10 flex items-center justify-center h-full px-4 sm:px-6">
        <div className="w-full max-w-4xl py-4 text-center">
          <div className="inline-block mb-4">
            <Badge
              variant="outline"
              className="p-2 text-xs text-white rounded-full bg-primary border-ring"
            >
              LET US GUIDE YOUR HOME
            </Badge>
          </div>

          <h1 className="text-3xl font-bold leading-tight text-white md:text-5xl">
            Believe in finding it
          </h1>

          <p className="max-w-2xl mx-auto mt-2 text-base text-white md:text-lg">
            Search properties for sale and to rent in the UK Search properties for sale and to rent in the UK Search properties for sale and to rent in the UK
          </p>

          {/* Search block */}
          <div className="w-full max-w-lg mx-auto mt-6">
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter Name, Keywords..."
                className="w-full p-5 pr-12 border-0 rounded-full bg-card"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute p-3 -translate-y-1/2 rounded-full right-2 top-1/2 bg-muted"
                aria-label="search"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* quick category buttons */}
          <div className="flex flex-col items-center justify-center gap-4 mt-6 md:flex-row">
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="outline" className="p-2 pl-0 rounded-full bg-card backdrop-blur-sm">
                <div className="inline-flex items-center p-2 mr-1 rounded-full bg-muted">
                  <Home className="w-4 h-4" />
                </div>
                Modern Villa
              </Button>

              <Button variant="outline" className="p-2 pl-0 rounded-full bg-card backdrop-blur-sm">
                <div className="inline-flex items-center p-2 mr-1 rounded-full bg-muted">
                  <Building className="w-4 h-4" />
                </div>
                Apartment
              </Button>

              <Button variant="outline" className="p-2 pl-0 rounded-full bg-card backdrop-blur-sm">
                <div className="inline-flex items-center p-2 mr-1 rounded-full bg-muted">
                  <Warehouse className="w-4 h-4" />
                </div>
                Town House
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
