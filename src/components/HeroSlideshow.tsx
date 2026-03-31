import { useState, useEffect } from 'react';

const HERO_IMAGES = [
  'gallery/herb-chicken.jpg',
];

export function HeroSlideshow() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {HERO_IMAGES.map((src, i) => (
        <img
          key={src}
          src={`${import.meta.env.BASE_URL}${src}`}
          alt="Perfect Perfections catering"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
    </>
  );
}
