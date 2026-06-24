import Navigation from '@/components/Navigation';
import MobileTabBar from '@/components/MobileTabBar';
import OnboardingGate from '@/components/onboarding/OnboardingGate';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <main className="relative z-0">{children}</main>
      <MobileTabBar />
      <OnboardingGate />
    </>
  );
}
