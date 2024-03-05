import { DataSource } from 'typeorm';

export async function checkPostGISExtension(
  dataSource: DataSource,
): Promise<boolean> {
  try {
    const result = await dataSource.query(
      "SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'postgis');",
    );
    return result?.[0]?.exists;
  } catch (error) {
    console.error('Error checking PostGIS extension:', error);
    return false;
  }
}
