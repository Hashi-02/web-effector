'use client';

import { Button } from '@/components/button';
import { useRouter } from 'next/navigation';

export default function Top() {
  const router = useRouter();
  const goToEffectorPage = () => {
    router.push('/effector');
  };
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center">
        <h1>Web Effecter - Top</h1>
        <Button 
        onClick={goToEffectorPage}
        >Go to Effector Page!</Button>
      </main>
    </div>
  );
}
