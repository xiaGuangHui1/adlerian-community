import { useNavigate } from 'react-router-dom';

interface AvatarProps {
  name: string;
  src?: string | null;
  className?: string;
  textClassName?: string;
  /** 用户 id，传入后头像可点击，跳转到该用户主页 */
  userId?: string;
}

export default function Avatar({ name, src, className = 'w-10 h-10', textClassName = 'text-xs', userId }: AvatarProps) {
  const navigate = useNavigate();
  const cursor = userId ? 'cursor-pointer' : '';

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        onClick={(e) => {
          if (!userId) return;
          e.stopPropagation();
          navigate(`/profile/${userId}`);
        }}
        className={`${className} ${cursor} rounded-full object-cover flex-shrink-0`}
      />
    );
  }
  const initial = name.trim().charAt(0) || '勇';
  return (
    <div
      onClick={(e) => {
        if (!userId) return;
        e.stopPropagation();
        navigate(`/profile/${userId}`);
      }}
      className={`${className} ${cursor} rounded-full bg-gradient-to-br from-peach-300 to-teal-300 flex items-center justify-center text-white ${textClassName} font-bold flex-shrink-0`}
    >
      {initial}
    </div>
  );
}
