import DiscoverShell from '@/components/discover/DiscoverShell';
import { TriviaHubProvider } from '@/components/trivia/use-hub';

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return (
    <TriviaHubProvider>
      <DiscoverShell>{children}</DiscoverShell>
    </TriviaHubProvider>
  );
}
