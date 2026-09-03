interface AvatarProps {
  name: string;
  src?: string | null;
  className?: string;
  textClassName?: string;
}

export default function Avatar({ name, src, className = 'w-10 h-10', textClassName = 'text-xs' }: AvatarProps) {
  if (src) {
    return <img src={src} alt={name} className={`${className} rounded-full object-cover flex-shrink-0`} />;
  }
  const initial = name.trim().charAt(0) || '勇';
  return (
    <div className={`${className} rounded-full bg-gradient-to-br from-peach-300 to-teal-300 flex items-center justify-center text-white ${textClassName} font-bold flex-shrink-0`}>
      {initial}
    </div>
  );
}
