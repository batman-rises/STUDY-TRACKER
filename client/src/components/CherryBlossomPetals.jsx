import { useMemo } from "react";

const CherryBlossomPetals = () => {
  const petals = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        id: index,
        left: `${(index * 37 + 9) % 100}%`,
        size: `${8 + ((index * 7) % 9)}px`,
        duration: `${13 + ((index * 5) % 12)}s`,
        delay: `${-((index * 3) % 20)}s`,
        drift: `${-35 + ((index * 19) % 70)}px`,
        opacity: 0.25 + ((index * 13) % 35) / 100,
      })),
    [],
  );

  return (
    <div
      className="pointer-events-none fixed inset-0 z-10 overflow-hidden"
      aria-hidden="true"
    >
      {petals.map((petal) => (
        <span
          key={petal.id}
          className="sakura-petal"
          style={{
            "--petal-left": petal.left,
            "--petal-size": petal.size,
            "--petal-duration": petal.duration,
            "--petal-delay": petal.delay,
            "--petal-drift": petal.drift,
            "--petal-opacity": petal.opacity,
          }}
        />
      ))}
    </div>
  );
};

export default CherryBlossomPetals;
