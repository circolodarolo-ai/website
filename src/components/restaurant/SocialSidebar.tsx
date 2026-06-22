'use client';

import { useState, useEffect } from 'react';
import { Facebook, Instagram, X, MessageCircle, Share2, XCircle } from 'lucide-react';

export default function SocialSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUrl] = useState(() => {
    if (typeof window !== 'undefined') return window.location.href;
    return '';
  });

  const shareText = 'Ti consiglio questo ristorante!';

  const generateShareUrl = (platform: string) => {
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedText = encodeURIComponent(shareText);
    switch (platform) {
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
      case 'x':
        return `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
      case 'whatsapp':
        return `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
      case 'instagram':
        return 'https://www.instagram.com';
      default:
        return '#';
    }
  };

  const socialLinks = [
    { name: 'Facebook', url: generateShareUrl('facebook'), icon: Facebook, color: 'bg-blue-600 hover:bg-blue-700' },
    { name: 'X', url: generateShareUrl('x'), icon: X, color: 'bg-black hover:bg-gray-800' },
    { name: 'Instagram', url: generateShareUrl('instagram'), icon: Instagram, color: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400' },
    { name: 'WhatsApp', url: generateShareUrl('whatsapp'), icon: MessageCircle, color: 'bg-green-600 hover:bg-green-700' },
  ];

  const handleClick = (social: { name: string; url: string }, e: React.MouseEvent) => {
    if (social.name === 'Instagram') {
      e.preventDefault();
      navigator.clipboard.writeText(currentUrl).catch(() => {});
      window.open(social.url, '_blank');
    } else {
      const w = 600, h = 400;
      const left = (window.screen.width - w) / 2;
      const top = (window.screen.height - h) / 2;
      window.open(social.url, 'Condividi', `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`);
      e.preventDefault();
    }
  };

  return (
    <>
      {/* Sidebar panel */}
      {isOpen && (
        <div className="fixed left-0 top-1/2 -translate-y-1/2 z-50 bg-white shadow-xl rounded-r-xl border border-gray-200 p-2 flex flex-col gap-2 animate-in slide-in-from-left duration-200">
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors mx-auto"
            aria-label="Chiudi"
          >
            <XCircle className="h-4 w-4 text-gray-400" />
          </button>
          {socialLinks.map((social) => {
            const Icon = social.icon;
            return (
              <a
                key={social.name}
                href={social.url}
                onClick={(e) => handleClick(social, e)}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex justify-center items-center w-11 h-11 rounded-full ${social.color} text-white hover:scale-110 hover:shadow-md transition-all duration-200`}
                aria-label={`Condividi su ${social.name}`}
                title={`Condividi su ${social.name}`}
              >
                <Icon className="h-5 w-5" />
              </a>
            );
          })}
        </div>
      )}

      {/* Toggle button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-50 bg-red-700 hover:bg-red-800 text-white p-3 rounded-r-lg shadow-lg hover:scale-110 transition-all duration-300"
          aria-label="Condividi"
          title="Condividi"
        >
          <Share2 className="h-5 w-5" />
        </button>
      )}
    </>
  );
}