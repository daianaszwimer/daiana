import { HeroEffects } from "@/app/components/hero/hero-effects";
import { PhaseSelect } from "@/app/components/phase-select";

export default function Home() {
  return (
    <main className="sky relative h-dvh w-full overflow-hidden">
      <HeroEffects className="grid size-full place-items-center">
        <h1 className="select-none px-4 text-center text-[clamp(4rem,18vw,16rem)] font-semibold leading-none tracking-tight text-[var(--fg)] transition-colors duration-1000">
          Daiana
        </h1>
      </HeroEffects>
      <PhaseSelect className="absolute right-4 top-4" />
    </main>
  );
}
