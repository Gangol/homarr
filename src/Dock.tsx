import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Sample app data (replace with actual Homarr app integrations)
interface App {
  id: string;
  name: string;
  icon: string; // URL or path to icon
  url: string; // URL to the app
}

const apps: App[] = [
  { id: 'sonarr', name: 'Sonarr', icon: '/icons/sonarr.png', url: 'http://your-server:8989' },
  { id: 'radarr', name: 'Radarr', icon: '/icons/radarr.png', url: 'http://your-server:7878' },
  { id: 'plex', name: 'Plex', icon: '/icons/plex.png', url: 'http://your-server:32400' },
];

const Dock: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center">
      <div
        className="flex items-center bg-gray-800/80 backdrop-blur-md rounded-t-2xl py-2 px-4 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 hover:shadow-lg group"
        style={{ transform: 'translateY(100%)', opacity: 0 }}
      >
        {apps.map((app) => (
          <Link
            key={app.id}
            href={app.url}
            className="mx-2 transition-transform duration-200 transform group-hover:scale-110"
            title={app.name}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src={app.icon}
              alt={app.name}
              width={48}
              height={48}
              className="rounded-md hover:shadow-md"
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dock;
