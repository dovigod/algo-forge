import { useEffect, useState } from 'react';
import TestSuspense from './TestSuspense';

let x: any = null;
export const SampleComponent = () => {
  const [t, setT] = useState(true);
  const [c, setC] = useState(false);

  useEffect(() => {
    if (!x) {
      x = setTimeout(() => {
        setT((t) => !t);
      }, 2000);
    }
  }, []);

  useEffect(() => {
    setC(true);
  }, []);

  if (!c) {
    console.log('state change successfully');
  }
  return (
    <>
      <button
        className={
          t ? 'text-yellow-300 bg-red-600' : 'text-black-800 bg-blue-600'
        }
      >
        sample button
      </button>
      <br />
      <br />
      <br />
      <TestSuspense />
    </>
  );
};
