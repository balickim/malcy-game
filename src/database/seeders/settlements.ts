// generator script
// TODO create real seeders

// Szczecin
const cityBounds: [number, number][] = [
  [53.391874, 14.424565], // south, west point
  [53.516425, 14.653759], // north, east point
];

const randomInRange = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const settlements = [];
for (let i = 0; i < 100; i++) {
  const lat = randomInRange(cityBounds[0][0], cityBounds[1][0]);
  const lng = randomInRange(cityBounds[0][1], cityBounds[1][1]);
  const id = `gen_${i}`;
  const name = `Settlement_${i}`;

  // Generate the POINT geometry as text
  const location = `POINT(${lng} ${lat})`; // Note: In PostGIS, the point is specified as (longitude latitude)

  settlements.push({ id, name, location }); // Changed lat, lng to location
}

const sqlInserts = settlements
  .map(
    (s) => `('${s.id}', '${s.name}', ST_GeomFromText('${s.location}', 4326))`,
  ) // Use ST_GeomFromText to convert text to geometry
  .join(',\n');

console.log(
  `INSERT INTO settlement (id, name, location) VALUES\n${sqlInserts};`, // Changed lat, lng to location
);
