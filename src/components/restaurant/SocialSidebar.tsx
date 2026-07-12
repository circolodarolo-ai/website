'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Facebook,
  Instagram,
  X,
  MessageCircle,
  Share2,
  XCircle,
  Mail,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';

export default function SocialSidebar() {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [pageTitle, setPageTitle] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
      setPageTitle(document.title);
    }
  }, []);

  // Ricarica l'URL quando la rotta cambia (SPA navigation)
  useEffect(() => {
    const updateUrl = () => {
      if (typeof window !== 'undefined') {
        setCurrentUrl(window.location.href);
        setPageTitle(document.title);
      }
    };
    const observer = new MutationObserver(updateUrl);
    if (typeof document !== 'undefined') {
      observer.observe(document.querySelector('title') || document.documentElement, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }
    return () => observer.disconnect();
  }, []);

  const shareText = pageTitle
    ? `${pageTitle} - ${t('social.shareText')}`
    : t('social.defaultShareText');

  const openNativeShare = useCallback(
    (url: string) => {
      window.location.href = url;
    },
    []
  );

  // Icona Telegram via immagine (lucide-react non ce l'ha, e gli SVG inline danno problemi)
  const telegramIcon = (
    <img
      src="https://cdn.simpleicons.org/telegram/#26A5E4"
      alt="Telegram"
      width="20"
      height="20"
      style={{ filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.3))' }}
    />
  );

  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="h-5 w-5" />,
      color: 'bg-green-600 hover:bg-green-700',
      ariaLabel: t('social.condividiWhatsApp'),
      onClick: () => {
        const url = encodeURIComponent(currentUrl);
        const text = encodeURIComponent(shareText);
        openNativeShare(`https://wa.me/?text=${text}%20${url}`);
      },
    },
    {
      name: 'Telegram',
      icon: telegramIcon,
      color: 'bg-sky-500 hover:bg-sky-600',
      ariaLabel: t('social.condividiTelegram'),
      onClick: () => {
        const url = encodeURIComponent(currentUrl);
        const text = encodeURIComponent(shareText);
        openNativeShare(`https://t.me/share/url?url=${url}&text=${text}`);
      },
    },
    {
      name: 'Facebook',
      icon: <Facebook className="h-5 w-5" />,
      color: 'bg-blue-600 hover:bg-blue-700',
      ariaLabel: t('social.condividiFacebook'),
      onClick: () => {
        const url = encodeURIComponent(currentUrl);
        openNativeShare(`https://www.facebook.com/sharer/sharer.php?u=${url}`);
      },
    },
    {
      name: 'X',
      icon: <X className="h-5 w-5" />,
      color: 'bg-black hover:bg-gray-800',
      ariaLabel: t('social.condividiX'),
      onClick: () => {
        const url = encodeURIComponent(currentUrl);
        const text = encodeURIComponent(shareText);
        openNativeShare(`https://x.com/intent/tweet?url=${url}&text=${text}`);
      },
    },
    {
      name: 'Instagram',
      icon: <Instagram className="h-5 w-5" />,
      color: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400',
      ariaLabel: t('social.copiaLinkInstagram'),
      onClick: async () => {
        try {
          await navigator.clipboard.writeText(currentUrl);
          const btn = document.querySelector('[data-social="instagram"]') as HTMLElement;
          if (btn) {
            btn.style.backgroundColor = '#22c55e';
            btn.setAttribute('title', t('social.linkCopiato'));
            setTimeout(() => {
              btn.style.backgroundColor = '';
              btn.setAttribute('title', t('social.copiaLinkInstagram'));
            }, 1500);
          }
        } catch {
          const textArea = document.createElement('textarea');
          textArea.value = currentUrl;
          textArea.style.position = 'fixed';
          textArea.style.opacity = '0';
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }
      },
    },
    {
      name: 'Email',
      icon: <Mail className="h-5 w-5" />,
      color: 'bg-red-600 hover:bg-red-700',
      ariaLabel: t('social.condividiEmail'),
      onClick: () => {
        const url = encodeURIComponent(currentUrl);
        const subject = encodeURIComponent(t('social.emailSubject'));
        const body = encodeURIComponent(t('social.emailBody'));
        openNativeShare(`mailto:?subject=${subject}&body=${body}`);
      },
    },
  ];

  return (
    <>
      {/* Sidebar panel */}
      {isOpen && (
        <div className="fixed left-0 top-1/2 -translate-y-1/2 z-50 bg-white shadow-xl rounded-r-xl border border-gray-200 p-2 flex flex-col gap-2 animate-in slide-in-from-left duration-200">
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors mx-auto"
            aria-label={t('social.chiudi')}
          >
            <XCircle className="h-4 w-4 text-gray-400" />
          </button>
          {socialLinks.map((social) => (
            <button
              key={social.name}
              data-social={social.name.toLowerCase()}
              onClick={social.onClick}
              className={`flex justify-center items-center w-11 h-11 rounded-full ${social.color} text-white hover:scale-110 hover:shadow-md transition-all duration-200 cursor-pointer`}
              aria-label={social.ariaLabel}
              title={social.name}
            >
              {social.icon}
            </button>
          ))}
        </div>
      )}

      {/* Toggle button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-50 text-white p-3 rounded-r-lg shadow-lg hover:scale-110 transition-all duration-300"
          style={{ backgroundColor: 'var(--social-btn-color)' }}
          aria-label={t('social.share')}
          title={t('social.share')}
        >
          <Share2 className="h-5 w-5" />
        </button>
      )}
    </>
  );
}