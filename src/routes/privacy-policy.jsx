import { createFileRoute, Link } from "@tanstack/react-router";
import { GlobalHero } from "@/components/global/GlobalHero";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/privacy-policy")({
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  const companyName = "The Zalmi Marketing";
  const companyEmail = "thezalmimarkettingsajidmahmood@gmail.com";
  const websiteUrl = "https://www.thezalmimarketing.com"; // Placeholder URL

  const policySections = [
    {
      title: "Introduction",
      content: `Welcome to ${companyName}. We are committed to protecting your privacy and handling your personal data in an open and transparent manner. This privacy policy explains how we collect, use, disclose, and safeguard your information when you visit our website, ${websiteUrl}, and use our services.`,
    },
    {
      title: "Information We Collect",
      content: `We may collect personal information that you voluntarily provide to us when you express an interest in obtaining information about us or our products and services, when you participate in activities on the website, or otherwise when you contact us. The personal information we collect may include: Name, Email Address, Phone Number, and any other information you choose to provide in your message.`,
    },
    {
      title: "How We Use Your Information",
      content: `We use the information we collect or receive to:
        <ul class="list-disc list-inside space-y-2 mt-4">
          <li>Respond to your inquiries and fulfill your requests.</li>
          <li>Send administrative information to you, such as changes to our terms, conditions, and policies.</li>
          <li>Provide you with marketing and promotional communications.</li>
          <li>Improve our website and services for a better user experience.</li>
          <li>Ensure the security of our website and prevent fraud.</li>
        </ul>`,
    },
    {
        title: "Sharing Your Information",
        content: `We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information unless we provide users with advance notice. This does not include website hosting partners and other parties who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.`,
    },
    {
        title: "Data Security",
        content: `We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.`,
    },
    {
        title: "Your Privacy Rights",
        content: `You have the right to review, change, or terminate your account at any time. If you are a resident in the European Economic Area (EEA) or UK and you believe we are unlawfully processing your personal information, you also have the right to complain to your local data protection supervisory authority.`,
    },
    {
        title: "Contact Us",
        content: `If you have questions or comments about this policy, you may email us at <a href="mailto:${companyEmail}" class="text-primary hover:underline">${companyEmail}</a> or by post to our office address.`,
    }
  ];

  return (
    <div>
      <GlobalHero image="/images/real-estate-3337038_1280.jpg" overlay height="50vh">
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white">
          <ShieldCheck className="w-16 h-16 mb-4" />
          <h1 className="text-4xl font-bold md:text-5xl">Privacy Policy</h1>
          <p className="mt-4 text-lg text-white/90">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </GlobalHero>
      <div className="py-16 bg-background sm:py-24">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="space-y-8">
                    {policySections.map((section, index) => (
                        <Card key={index} className="bg-card">
                            <CardHeader>
                                <CardTitle className="text-2xl text-primary">{section.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose text-foreground max-w-none" dangerouslySetInnerHTML={{ __html: section.content }} />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
