import { KEYS, keyBox, noteName } from "./keys";
import { clamp, type Piano } from "./use-piano";
import styles from "./key-bed.module.css";

/** Flat top-down keys, labeled with letter, sounding note and MIDI number. */
export function KeyBed({ piano, className = "" }: { piano: Piano; className?: string }) {
  const { settings: s } = piano;
  const shift = s.octave * 12 + s.transpose;
  return (
    <div className={`${styles.bed} ${className}`} {...piano.keyBedProps}>
      {KEYS.map((k) => {
        const { left, width } = keyBox(k);
        const sounding = clamp(k.midi + shift, 0, 127);
        return (
          <div
            key={k.index}
            data-key={k.index}
            data-pressed={piano.pressed.has(k.index) ? "" : undefined}
            className={k.isBlack ? styles.black : styles.white}
            style={{ left: `${left}%`, width: `${width}%` }}
          >
            {s.labels && (
              <span className={styles.label}>
                <b>{k.letter}</b>
                <span>{noteName(sounding)}</span>
                {!k.isBlack && <span className={styles.num}>{sounding}</span>}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
