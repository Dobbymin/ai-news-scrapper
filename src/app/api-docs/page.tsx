import {
  BaseURLSection,
  EndPointsSection,
  FooterNoticeSection,
  HeroSection,
  ResponseExamplesSection,
  RoadmapSection,
} from "@/features";

export const dynamic = "force-dynamic";

export default async function ApiDocsPage() {
  return (
    <div className='space-y-10'>
      {/* Hero Section */}
      <HeroSection />

      {/* Base URL */}
      <BaseURLSection />

      {/* Endpoints */}
      <EndPointsSection />

      {/* Response Examples */}
      <ResponseExamplesSection />

      {/* Roadmap */}
      <RoadmapSection />

      {/* Footer Notice */}
      <FooterNoticeSection />
    </div>
  );
}
