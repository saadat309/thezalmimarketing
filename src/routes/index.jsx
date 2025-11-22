import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import HeroSection from "@/components/home/HeroSection";
import PropertyCard from "@/components/home/PropertyCard";
import CardSlider from "@/components/home/CardSlider";
import PersonalizedExperience from "@/components/home/PersonalizedExperience";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

const propertyCardVariants = [
  {
    title: "Modern Luxury Villa with Pool",
    price: 25000000,
    priceType: "sale",
    currency: "Rs",
    location: "DHA Phase 5",
    city: "Karachi",
    locationMap:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108879.79153579057!2d74.22606518174483!3d31.52834570076263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107af%3A0x8610bd995cbf76c6!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1701725064893!5m2!1sen!2s",
    beds: 5,
    baths: 4,
    area: 4500,
    areaUnit: "sqft",
    propertyType: "Villa",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9",
    isVisible: true,
    badges: [
      { label: "For Sale", variant: "sale" },
      { label: "Premium", variant: "secondary" },
    ],
  },
  {
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
    title: "Cozy 2-Bed Apartment",
    price: 85000,
    priceType: "rent",
    currency: "Rs",
    location: "Gulberg",
    city: "Lahore",
    locationMap:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108879.79153579057!2d74.22606518174483!3d31.52834570076263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107af%3A0x8610bd995cbf76c6!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1701725064893!5m2!1sen!2s",
    beds: 2,
    baths: 2,
    area: 1200,
    areaUnit: "sqft",
    propertyType: "Apartment",
    badges: [
      { label: "For Rent", variant: "rent" },
      { label: "Furnished", variant: "secondary" },
    ],
  },
  {
    image: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7",
    title: "Commercial Plaza Space",
    price: 45000000,
    priceType: "sale",
    currency: "Rs",
    originalPrice: 50000000,
    location: "Blue Area",
    city: "Islamabad",
    locationMap:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108879.79153579057!2d74.22606518174483!3d31.52834570076263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107af%3A0x8610bd995cbf76c6!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1701725064893!5m2!1sen!2s",
    area: 8000,
    areaUnit: "sqft",
    propertyType: "Commercial",
badges: [{ label: "For Sale", variant: "sale" }, { label: "Discounted", variant: "discounted" }, { label: "Investment", variant: "outline" }]
  },
  {
    image: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90",
    title: "Luxury Penthouse Suite",
    price: 150000,
    priceType: "rent",
    currency: "Rs",
    location: "Clifton",
    city: "Karachi",
    locationMap:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108879.79153579057!2d74.22606518174483!3d31.52834570076263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107af%3A0x8610bd995cbf76c6!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1701725064893!5m2!1sen!2s",
    beds: 3,
    baths: 3,
    area: 2200,
    areaUnit: "sqft",
    propertyType: "Penthouse",
    badges: [
      { label: "Rent", variant: "rent" },
      { label: "Luxury", variant: "featured" },
      { label: "Sea View", variant: "default" },
    ],
  },
  {
    image: "https://images.unsplash.com/photo-1605146769289-440113cc3d00",
    title: "Installment Plan House",
    price: 50000,
    priceType: "installment",
    currency: "Rs",
    installmentPeriod: "month",
    installmentDuration: "60 months",
    location: "Bahria Town",
    city: "Rawalpindi",
    locationMap:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108879.79153579057!2d74.22606518174483!3d31.52834570076263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107af%3A0x8610bd995cbf76c6!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1701725064893!5m2!1sen!2s",
    beds: 4,
    baths: 3,
    area: 2800,
    areaUnit: "sqft",
    propertyType: "House",
    badges: [{ label: "Installment", variant: "default" }],
  },
  {
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
    title: "Budget Studio Apartment",
    price: 25000,
    priceType: "rent",
    currency: "Rs",
    location: "PECHS",
    city: "Karachi",
    beds: 1,
    baths: 1,
    area: 600,
    areaUnit: "sqft",
    propertyType: "Studio",
    badges: [
      { label: "Rent", variant: "rent" },
      { label: "New", variant: "new" },
    ],
  },
  {
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3",
    title: "Farm House for Sale",
    price: 15000000,
    priceType: "sale",
    currency: "Rs",
    location: "Murree Road",
    city: "Murree",
    locationMap:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108879.79153579057!2d74.22606518174483!3d31.52834570076263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107af%3A0x8610bd995cbf76c6!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1701725064893!5m2!1sen!2s",
    beds: 6,
    baths: 5,
    area: 10000,
    areaUnit: "sqft",
    propertyType: "Farmhouse",
    badges: [
      { label: "Sale", variant: "sale" },
      { label: "Mountain View", variant: "default" },
    ],
  },
  {
    image: "https://images.unsplash.com/photo-1600585154340-9635eaea2667",
    title: "Modern Office Space",
    price: 120000,
    priceType: "rent",
    currency: "Rs",
    location: "II Chundrigar Road",
    city: "Karachi",
    locationMap:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108879.79153579057!2d74.22606518174483!3d31.52834570076263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107af%3A0x8610bd995cbf76c6!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1701725064893!5m2!1sen!2s",
    area: 2500,
    areaUnit: "sqft",
    propertyType: "Office",
    badges: [
      { label: "Rent", variant: "rent" },
      { label: "New", variant: "new" },
    ],
  },
  {
    image: "https://images.unsplash.com/photo-1600607687644-c7171b42498b",
    title: "Duplex House in Gated Community",
    price: 35000000,
    priceType: "sale",
    currency: "Rs",
    originalPrice: 38000000,
    location: "Defence",
    city: "Lahore",
    locationMap:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108879.79153579057!2d74.22606518174483!3d31.52834570076263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107af%3A0x8610bd995cbf76c6!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1701725064893!5m2!1sen!2s",
    beds: 4,
    baths: 4,
    area: 3200,
    areaUnit: "sqft",
    propertyType: "Duplex",
    badges: [
      { label: "Sale", variant: "sale" },
      { label: "Discounted", variant: "discounted" },
      { label: "Gated", variant: "default" },
    ],
  },
  {
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde",
    title: "Student Hostel Room",
    price: 15000,
    priceType: "rent",
    currency: "Rs",
    location: "Near University",
    city: "Peshawar",
    beds: 1,
    baths: 1,
    area: 200,
    areaUnit: "sqft",
    propertyType: "Hostel",
    badges: [
      { label: "Rent", variant: "rent" },
      { label: "New", variant: "new" },
    ],
  },
  {
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d",
    title: "Luxury Apartment with Amenities",
    price: 180000,
    priceType: "rent",
    currency: "Rs",
    location: "E-11",
    city: "Islamabad",
    locationMap:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108879.79153579057!2d74.22606518174483!3d31.52834570076263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107af%3A0x8610bd995cbf76c6!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1701725064893!5m2!1sen!2s",
    beds: 3,
    baths: 2,
    area: 1800,
    areaUnit: "sqft",
    propertyType: "Apartment",
    badges: [
      { label: "Rent", variant: "rent" },
      { label: "Swimming Pool", variant: "featured" },
      { label: "Gym", variant: "default" },
    ],
  },
  {
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
    title: "Commercial Shop in Mall",
    price: 8000000,
    priceType: "sale",
    currency: "Rs",
    location: "Dolmen Mall",
    city: "Karachi",
    locationMap:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108879.79153579057!2d74.22606518174483!3d31.52834570076263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107af%3A0x8610bd995cbf76c6!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1701725064893!5m2!1sen!2s",
    area: 800,
    areaUnit: "sqft",
    propertyType: "Commercial",
    badges: [
      { label: "Sale", variant: "sale" },
      { label: "New", variant: "new" },
    ],
  },
  {
    image: "https://images.unsplash.com/photo-1600566753151-384129cf4e3e",
    title: "Beach Front Property",
    price: 75000000,
    priceType: "sale",
    currency: "Rs",
    location: "Sea View",
    city: "Karachi",
    locationMap:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108879.79153579057!2d74.22606518174483!3d31.52834570076263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107af%3A0x8610bd995cbf76c6!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1701725064893!5m2!1sen!2s",
    beds: 5,
    baths: 4,
    area: 5000,
    areaUnit: "sqft",
    propertyType: "Villa",
    badges: [
      { label: "Sale", variant: "sale" },
      { label: "Hot", variant: "hot" },
      { label: "Featured", variant: "featured" },
    ],
  },
  {
    image: "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198",
    title: "6-Month Installment Plan",
    price: 75000,
    priceType: "installment",
    currency: "Rs",
    installmentPeriod: "6-month",
    installmentDuration: "24 installments",
    location: "Model Town",
    city: "Lahore",
    locationMap:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108879.79153579057!2d74.22606518174483!3d31.52834570076263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107af%3A0x8610bd995cbf76c6!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1701725064893!5m2!1sen!2s",
    beds: 3,
    baths: 2,
    area: 1500,
    areaUnit: "sqft",
    propertyType: "House",
    badges: [{ label: "New", variant: "new" }],
  },
  {
    image: "https://images.unsplash.com/photo-1600607688969-a5bfcd646154",
    title: "Compact 1-Bed Apartment",
    price: 35000,
    priceType: "rent",
    currency: "Rs",
    location: "North Nazimabad",
    city: "Karachi",
    beds: 1,
    baths: 1,
    area: 700,
    areaUnit: "sqft",
    propertyType: "Apartment",
    badges: [
      { label: "Rent", variant: "rent" },
      { label: "New", variant: "new" },
    ],
  },
  {
    image: "https://images.unsplash.com/photo-1600585154340-9635eaea2667",
    title: "Warehouse for Rent",
    price: 200000,
    priceType: "rent",
    currency: "Rs",
    location: "SITE Area",
    city: "Karachi",
    locationMap:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108879.79153579057!2d74.22606518174483!3d31.52834570076263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107af%3A0x8610bd995cbf76c6!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1701725064893!5m2!1sen!2s",
    area: 10000,
    areaUnit: "sqft",
    propertyType: "Warehouse",
    badges: [
      { label: "Rent", variant: "rent" },
      { label: "New", variant: "new" },
    ],
  },
  {
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde",
    title: "Yearly Installment Plan",
    price: 200000,
    priceType: "installment",
    currency: "Rs",
    installmentPeriod: "year",
    installmentDuration: "10 years",
    location: "F-7",
    city: "Islamabad",
    locationMap:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108879.79153579057!2d74.22606518174483!3d31.52834570076263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107af%3A0x8610bd995cbf76c6!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1701725064893!5m2!1sen!2s",
    beds: 4,
    baths: 3,
    area: 2400,
    areaUnit: "sqft",
    propertyType: "House",
    badges: [{ label: "Installment", variant: "default" }],
  },
  {
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3",
    title: "Luxury Penthouse with Terrace",
    price: 300000,
    priceType: "rent",
    currency: "Rs",
    location: "DHA Phase 6",
    city: "Karachi",
    locationMap:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108879.79153579057!2d74.22606518174483!3d31.52834570076263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107af%3A0x8610bd995cbf76c6!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1701725064893!5m2!1sen!2s",
    beds: 4,
    baths: 3,
    area: 2800,
    areaUnit: "sqft",
    propertyType: "Penthouse",
    badges: [
      { label: "Rent", variant: "rent" },
      { label: "Terrace", variant: "featured" },
      { label: "City View", variant: "default" },
    ],
  },
  {
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d",
    title: "Medical Clinic Space",
    price: 15000000,
    priceType: "sale",
    currency: "Rs",
    location: "Jinnah Hospital Road",
    city: "Karachi",
    locationMap:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108879.79153579057!2d74.22606518174483!3d31.52834570076263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107af%3A0x8610bd995cbf76c6!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1701725064893!5m2!1sen!2s",
    area: 1500,
    areaUnit: "sqft",
    propertyType: "Commercial",
    badges: [
      { label: "Sale", variant: "sale" },
      { label: "New", variant: "new" },
    ],
  },
  {
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
    title: "Family House with Garden",
    price: 42000000,
    priceType: "sale",
    currency: "Rs",
    originalPrice: 45000000,
    location: "Cantt",
    city: "Lahore",
    locationMap:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108879.79153579057!2d74.22606518174483!3d31.52834570076263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107af%3A0x8610bd995cbf76c6!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1701725064893!5m2!1sen!2s",
    beds: 5,
    baths: 4,
    area: 3800,
    areaUnit: "sqft",
    propertyType: "House",
    badges: [
      { label: "Sale", variant: "sale" },
      { label: "Garden", variant: "default" },
    ],
  },
  {
    image: "https://images.unsplash.com/photo-1600566753151-384129cf4e3e",
    title: "3-Month Installment Plan",
    price: 60000,
    priceType: "installment",
    currency: "Rs",
    installmentPeriod: "3-month",
    installmentDuration: "36 installments",
    location: "Gulshan-e-Iqbal",
    city: "Karachi",
    locationMap:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108879.79153579057!2d74.22606518174483!3d31.52834570076263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107af%3A0x8610bd995cbf76c6!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1701725064893!5m2!1sen!2s",
    beds: 2,
    baths: 2,
    area: 1100,
    areaUnit: "sqft",
    propertyType: "Apartment",
    badges: [{ label: "New", variant: "new" }],
  },
  {
    image: "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198",
    title: "Office in Business District",
    price: 95000,
    priceType: "rent",
    currency: "Rs",
    location: "Sharae Faisal",
    city: "Karachi",
    locationMap:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108879.79153579057!2d74.22606518174483!3d31.52834570076263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107af%3A0x8610bd995cbf76c6!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1701725064893!5m2!1sen!2s",
    area: 1800,
    areaUnit: "sqft",
    propertyType: "Office",
    badges: [
      { label: "Rent", variant: "rent" },
      { label: "Prime Location", variant: "featured" },
    ],
  },
  {
    image: "https://images.unsplash.com/photo-1600607687644-c7171b42498b",
    title: "Luxury Apartment in High-Rise",
    price: 28000000,
    priceType: "sale",
    currency: "Rs",
    location: "Clifton",
    city: "Karachi",
    locationMap:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108879.79153579057!2d74.22606518174483!3d31.52834570076263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107af%3A0x8610bd995cbf76c6!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1701725064893!5m2!1sen!2s",
    beds: 3,
    baths: 3,
    area: 2000,
    areaUnit: "sqft",
    propertyType: "Apartment",
    badges: [
      { label: "Sale", variant: "sale" },
      { label: "High-Rise", variant: "featured" },
      { label: "Amenities", variant: "default" },
    ],
  },
  {
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde",
    title: "2-Bed Flat for Students",
    price: 20000,
    priceType: "rent",
    currency: "Rs",
    location: "University Road",
    city: "Hyderabad",
    beds: 2,
    baths: 1,
    area: 800,
    areaUnit: "sqft",
    propertyType: "Flat",
  },
  {
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d",
    title: "Industrial Plot",
    price: 25000000,
    priceType: "sale",
    currency: "Rs",
    location: "Korangi Industrial Area",
    city: "Karachi",
    locationMap:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108879.79153579057!2d74.22606518174483!3d31.52834570076263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107af%3A0x8610bd995cbf76c6!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1701725064893!5m2!1sen!2s",
    area: 1200,
    areaUnit: "sq yards",
    propertyType: "Plot",
  },
  {
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3",
    title: "Luxury Farmhouse",
    price: 120000,
    priceType: "rent",
    currency: "Rs",
    location: "Bhurban",
    city: "Murree",
    locationMap:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108879.79153579057!2d74.22606518174483!3d31.52834570076263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107af%3A0x8610bd995cbf76c6!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1701725064893!5m2!1sen!2s",
    baths: 5,
    area: 8500,
    areaUnit: "sqft",
    propertyType: "Farmhouse",
    badges: [
      { label: "Mountain", variant: "secondary" },
      { label: "Luxury", variant: "default" },
    ],
  },
  {
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
    title: "2-Month Installment Plan",
    price: 45000,
    priceType: "installment",
    currency: "Rs",
    installmentPeriod: "2-month",
    installmentDuration: "48 installments",
    location: "Gulistan-e-Johar",
    city: "Karachi",
    locationMap:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108879.79153579057!2d74.22606518174483!3d31.52834570076263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107af%3A0x8610bd995cbf76c6!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1701725064893!5m2!1sen!2s",
    beds: 2,
    baths: 1,
    area: 900,
    areaUnit: "sqft",
    propertyType: "Apartment",
  },
  {
    image: "https://images.unsplash.com/photo-1600585154340-9635eaea2667",
    title: "Showroom in Commercial Area",
    price: 35000000,
    priceType: "sale",
    currency: "Rs",
    originalPrice: 38000000,
    location: "Tariq Road",
    city: "Karachi",
    locationMap:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108879.79153579057!2d74.22606518174483!3d31.52834570076263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107af%3A0x8610bd995cbf76c6!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1701725064893!5m2!1sen!2s",
    area: 1200,
    areaUnit: "sqft",
    propertyType: "Commercial",
    badges: [{ label: "Main Road", variant: "default" }],
  },
  {
    image: "https://images.unsplash.com/photo-1600607688969-a5bfcd646154",
    title: "Studio Apartment for Singles",
    price: 18000,
    priceType: "rent",
    currency: "Rs",
    location: "PECHS",
    city: "Karachi",
    beds: 1,
    baths: 1,
    area: 500,
    areaUnit: "sqft",
    propertyType: "Studio",
  },
  {
    image: "https://images.unsplash.com/photo-1600566753151-384129cf4e3e",
    title: "Beachside Cafe for Sale",
    price: 28000000,
    priceType: "sale",
    currency: "Rs",
    location: "Hawksbay",
    city: "Karachi",
    locationMap:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108879.79153579057!2d74.22606518174483!3d31.52834570076263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107af%3A0x8610bd995cbf76c6!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1701725064893!5m2!1sen!2s",
    area: 1500,
    areaUnit: "sqft",
    propertyType: "Commercial",
    badges: [
      { label: "Beachside", variant: "outline" },
      { label: "Running Business", variant: "secondary" },
    ],
  },
];

function RouteComponent() {
  return (
    <main className="flex flex-col items-center justify-center w-full text-center max-w-[1440px] mx-auto">
      <HeroSection />
      
    
            <CardSlider items={propertyCardVariants} />
      
            {/* Data for PersonalizedExperience component */}
            <PersonalizedExperience cards={[
              {
                title: "Looking for the new home?",
                description: "10 new offers every day. 350 offers on site, trusted by a community of thousands of users.",
                buttonText: "Get Started",
                buttonLink: "/listings", // Example link
                imagePath: "/house1.svg",
                backgroundColor: "bg-[var(--tea-green)]"
              },
              {
                title: "Want to sell your home?",
                description: "10 new offers every day. 350 offers on site, trusted by a community of thousands of users.",
                buttonText: "Get Started",
                buttonLink: "/sell-property", // Example link
                imagePath: "/house2.svg",
                backgroundColor: "bg-[var(--ash-grey)]"
              },
            ]} />
            
                  
      <div className="max-w-3xl pt-8">
        <h2 className="text-4xl font-extrabold text-primary sm:text-5xl md:text-6xl">
          Your Trusted Partner in Real Estate
        </h2>
        <p className="mt-4 text-xl text-muted-foreground">
          We specialize in marketing land files, housing society projects, and
          much more.
        </p>
      </div>

      <div className="container py-8 mx-auto">
        <h2 className="mb-8 text-3xl font-bold text-center text-gray-800">
          Featured Properties
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {propertyCardVariants.map((property, index) => (
            <PropertyCard
              key={index}
              {...property}
              onClick={() => alert(`Viewing: ${property.title}`)}
            />
          ))}
        </div>
      </div>

      

      <Card className="w-full max-w-md mt-12">
        <CardHeader>
          <CardTitle>Coming Soon!</CardTitle>
          <CardDescription>
            Our new website is under construction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We are working hard to bring you an amazing online experience. Stay
            tuned for our launch.
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

      <div className="flex flex-wrap justify-center gap-6 mt-12 mb-12">
        <div className="flex items-center space-x-2">
          <Checkbox id="terms1" />
          <Label htmlFor="terms1">Default Checkbox</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="terms2" checked />
          <Label htmlFor="terms2">Checked Checkbox</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="terms3" disabled />
          <Label htmlFor="terms3">Disabled Checkbox</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="terms4" checked disabled />
          <Label htmlFor="terms4">Disabled & Checked Checkbox</Label>
        </div>
      </div>
    </main>
  );
}
