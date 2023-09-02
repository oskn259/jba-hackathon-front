import {useCallback, useState, useEffect} from 'react';

// Intended to work on only client side (browser)
export const useLocalStorage = (key: string) => {
  const updateCounter = useState(0);
  const update = useCallback(() => updateCounter[1](updateCounter[0] + 1), []);

  const [value, setValue] = useState<string | null>('');
  const [save, setSave] = useState(() => (v: string) => {});

  useEffect(() => {
    setValue(localStorage.getItem(key));
  }, [updateCounter]);

  useEffect(() => setSave(
    () => (v: string) => {
      if (!v) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, v);
        update();
      }
    }
  ), []);

  const reset = useCallback(() => {
    localStorage.removeItem(key);
    update();
  }, []);

  return { value, save, reset };
}
