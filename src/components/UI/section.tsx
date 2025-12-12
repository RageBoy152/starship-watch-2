import { twMerge } from "tailwind-merge"

export default function Section({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <section className={twMerge("pointer-events-auto bg-bg-secondary/50 backdrop-blur-lg border border-label-primary/30 w-md p-4 flex flex-col gap-3 relative z-10 shadow-[inset_3px_3px_16px_rgba(0,0,0,0.2)]", className)}>
      {children}
    </section>
  );
}