import { useEffect, useState } from "react";

export function WelcomeOverlay({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<"selection" | "punishment">("selection");

  useEffect(() => {
    if (step === "punishment") {
      // Vibrate device if supported
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 100]);
      }

      const timer = setTimeout(() => {
        setStep("selection");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleStudentClick = () => {
    setStep("punishment");
  };

  const handleVisitorClick = () => {
    onComplete();
  };

  // Determine container classes based on state
  let containerClasses =
    "fixed inset-0 z-[100] flex flex-col items-center justify-center transition-colors duration-200";

  if (step === "punishment") {
    containerClasses +=
      " bg-red-600 text-white animate-shake cursor-not-allowed";
  } else {
    containerClasses += " bg-background text-foreground";
  }

  return (
    <div className={containerClasses}>
      {step === "selection" ? (
        <div className="animate-in fade-in zoom-in space-y-12 p-4 text-center duration-500">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            你是...
          </h1>
          <div className="flex flex-col gap-6 sm:flex-row sm:gap-10">
            <button
              onClick={handleStudentClick}
              className="group relative overflow-hidden rounded-xl border-2 border-current px-8 py-6 text-xl font-bold transition-all hover:scale-105 active:scale-95"
            >
              <span className="relative z-10">老彭的学生</span>
              <div className="bg-foreground absolute inset-0 -z-10 opacity-0 transition-opacity group-hover:opacity-10 dark:group-hover:opacity-20" />
            </button>
            <button
              onClick={handleVisitorClick}
              className="group relative overflow-hidden rounded-xl border-2 border-current px-8 py-6 text-xl font-bold transition-all hover:scale-105 active:scale-95"
            >
              <span className="relative z-10">陌生访客</span>
              <div className="bg-foreground absolute inset-0 -z-10 opacity-0 transition-opacity group-hover:opacity-10 dark:group-hover:opacity-20" />
            </button>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-5xl leading-tight font-black tracking-widest uppercase drop-shadow-xl md:text-7xl">
            小兔崽子
            <br />
            <span className="mt-4 block text-4xl md:text-6xl">
              不好好自己做来找我
            </span>
          </h1>
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: translate(-10px, -10px) rotate(-2deg); }
          20%, 40%, 60%, 80% { transform: translate(10px, 10px) rotate(2deg); }
        }
        .animate-shake {
          animation: shake 0.15s cubic-bezier(.36,.07,.19,.97) both infinite;
        }
      `}</style>
    </div>
  );
}
