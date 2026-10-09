import { useState } from 'react';

interface Props {
  name: string;
  src?: string;
  size?: number;
  ring?: string;
}

/** Avatar avec repli automatique sur les initiales si l'image ne charge pas. */
export default function Avatar({ name, src, size = 44, ring }: Props) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const style = { width: size, height: size, fontSize: size * 0.38, ...(ring ? { borderColor: ring } : {}) };

  if (!src || failed) {
    return <div className="avatar" style={style}>{initials || '?'}</div>;
  }
  return <img className="avatar" style={style} src={src} alt={name} onError={() => setFailed(true)} />;
}
