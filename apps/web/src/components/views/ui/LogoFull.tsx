import Image from 'next/image';

export function LogoFull({ className }: { className?: string }) {
  return (
    <Image 
      src="/bunjyLogo.webp" 
      alt="Bunjy AI" 
      width={62} 
      height={2} 
      className={className}
    />
  );
}2