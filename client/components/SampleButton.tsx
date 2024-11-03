'use client';
import { useEffect, useState } from 'react';

export const SampleButton = () => {
  const [t, setT] = useState(true);
  const [c, setC] = useState(false);

  console.log('is client?');

  console.log(useEffect);
  useEffect(() => {
    console.log('effect');
    setTimeout(() => {
      console.log('hit');
      setT((c) => !c);
    }, 2000);
  }, []);

  useEffect(() => {
    console.log('client');
    setC(true);
  }, []);

  if (!c) {
    return <div>is server....</div>;
  }
  return (
    <>
      <button
        className={
          t ? 'text-yellow-800 bg-red-600' : 'text-yellow-800 bg-blue-600'
        }
      >
        sample button
      </button>
    </>
  );
};
