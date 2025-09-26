'use client';

import { Mail, MessageCircle } from 'lucide-react';

interface ContactOptionsProps {
  variant?: 'default' | 'compact' | 'inline';
  className?: string;
}

const ContactOptions = ({ variant = 'default', className = '' }: ContactOptionsProps) => {
  const baseClasses = "flex items-center space-x-2 transition-colors";
  
  const variants = {
    default: "bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg",
    compact: "bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm",
    inline: "hover:text-green-400 transition-colors"
  };

  const iconSize = variant === 'compact' ? "h-4 w-4" : "h-4 w-4";

  return (
    <div className={`flex ${variant === 'inline' ? 'space-x-4' : 'space-x-3'} ${className}`}>
      <a 
        href="mailto:mail@autovoegeli.ch" 
        className={`${baseClasses} ${variants[variant]}`}
      >
        <Mail className={iconSize} />
        <span className="font-medium">E-Mail</span>
      </a>
      <a 
        href="https://wa.me/41786360619" 
        target="_blank" 
        rel="noopener noreferrer"
        className={`${baseClasses} ${variants[variant]}`}
      >
        <MessageCircle className={iconSize} />
        <span className="font-medium">WhatsApp</span>
      </a>
    </div>
  );
};

export default ContactOptions;
