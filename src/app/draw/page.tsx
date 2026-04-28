"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface DrawCard {
  id: number;
  value: number;
  isFlipped: boolean;
}

export default function DrawPage() {
  const [count, setCount] = useState<number>(5);
  const [cards, setCards] = useState<DrawCard[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const initCards = () => {
    const newCards = Array.from({ length: count }, (_, i) => ({
      id: i,
      value: i + 1,
      isFlipped: false,
    }));
    // Shuffle
    for (let i = newCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newCards[i], newCards[j]] = [newCards[j], newCards[i]];
    }
    setCards(newCards);
    setIsDrawing(true);
  };

  const flipCard = (id: number) => {
    setCards(
      cards.map((card) =>
        card.id === id ? { ...card, isFlipped: true } : card,
      ),
    );
  };

  const reset = () => {
    setCards([]);
    setIsDrawing(false);
  };

  return (
    <div className="p-8 min-h-[calc(100vh-40px)] flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full flex flex-col items-center">
        <div className="mb-12 space-y-6 text-center w-full">
          <h1 className="text-3xl font-bold">抽签</h1>
          {!isDrawing ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground whitespace-nowrap">卡片数量:</span>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 0)}
                  className="w-24 text-center"
                />
              </div>
              <Button size="lg" className="px-8" onClick={initCards}>开始抽签</Button>
            </div>
          ) : (
            <div className="flex justify-center">
              <Button variant="outline" onClick={reset}>
                重新设置
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 w-full max-w-3xl">
          <AnimatePresence>
            {cards.map((card) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
              >
                <div
                  className="relative w-full aspect-[3/4] cursor-pointer perspective-1000"
                  onClick={() => flipCard(card.id)}
                >
                  <motion.div
                    className="w-full h-full relative preserve-3d"
                    animate={{ rotateY: card.isFlipped ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    {/* Front */}
                    <Card className="absolute inset-0 backface-hidden flex items-center justify-center bg-primary/10 border-2 border-primary/20 shadow-lg">
                      <div className="text-4xl font-bold text-primary/20">?</div>
                    </Card>

                    {/* Back */}
                    <Card className="absolute inset-0 backface-hidden flex items-center justify-center bg-background border-2 border-primary shadow-xl rotate-y-180">
                      <div className="text-4xl font-bold text-primary">
                        {card.value}
                      </div>
                    </Card>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
