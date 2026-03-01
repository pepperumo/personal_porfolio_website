import { useState, useEffect, useRef, useCallback } from 'react';

const useScrollTyping = (text, { speed = 35, startDelay = 0, threshold = 0.3 } = {}) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const ref = useRef(null);

  const onIntersect = useCallback((entries) => {
    if (entries[0].isIntersecting) {
      setTriggered(true);
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(onIntersect, { threshold });
    observer.observe(el);

    return () => observer.disconnect();
  }, [onIntersect, threshold]);

  useEffect(() => {
    if (!triggered || !text) return;

    let i = 0;
    let timer;

    const startTyping = () => {
      timer = setInterval(() => {
        i += 1;
        if (i >= text.length) {
          clearInterval(timer);
          setDisplayed(text);
          setDone(true);
        } else {
          setDisplayed(text.slice(0, i));
        }
      }, speed);
    };

    const delayTimer = setTimeout(startTyping, startDelay);

    return () => {
      clearTimeout(delayTimer);
      clearInterval(timer);
    };
  }, [triggered, text, speed, startDelay]);

  return { displayed, done, ref };
};

export default useScrollTyping;
