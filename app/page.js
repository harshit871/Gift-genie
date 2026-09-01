import Image from 'next/image';
import AppContent from '@/app/components/AppContent';

export default function Home() {
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="title-group">
          <Image
            src="/genie.svg"
            alt="Genie"
            className="genie-icon-img"
            width={60}
            height={60}
          />
          <h1>Gift Genie</h1>
        </div>
      </header>

      <AppContent />
    </div>
  );
}
