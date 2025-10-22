declare module "canvas-confetti" {
  export type ConfettiOptions = {
    particleCount?: number;
    angle?: number;
    spread?: number;
    origin?: { x?: number; y?: number };
    scalar?: number;
  };

  export default function confetti(options?: ConfettiOptions): void;
}
