/**
 * IndexedDB Artifact Repository Adapter
 * Production persistence for artifacts
 */

import { Artifact } from '@/domain/entities/Artifact';
import { idb } from './IDBDatabase';

type Ok<T> = { readonly ok: true; readonly value: T };
type Err<E> = { readonly ok: false; readonly error: E };
type Result<T, E> = Ok<T> | Err<E>;

function Ok<T>(value: T): Ok<T> { return { ok: true, value }; }
function Err<E>(error: E): Err<E> { return { ok: false, error }; }

export class IndexedDBArtifactRepository {
  async save(artifact: Artifact): Promise<Result<Artifact, Error>> {
    try {
      const snapshot = artifact.toSnapshot();
      await idb.put('artifacts', snapshot);
      return Ok(artifact);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error('Failed to save artifact'));
    }
  }

  async findById(id: string): Promise<Result<Artifact | null, Error>> {
    try {
      const result = await idb.get<Artifact>('artifacts', id);
      if (!result.ok) throw result.error;
      return Ok(result.value ? Artifact.reconstruct(result.value) : null);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error('Failed to find artifact by ID'));
    }
  }

  async findByFilingId(filingId: string): Promise<Result<Artifact[], Error>> {
    try {
      const result = await idb.getAllByIndex<Artifact>('artifacts', 'filingId', filingId);
      if (!result.ok) throw result.error;
      const reconstructed = result.value.map((a: Artifact) => Artifact.reconstruct(a));
      reconstructed.sort((a: Artifact, b: Artifact) => b.timestamp.getTime() - a.timestamp.getTime());
      return Ok(reconstructed);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error('Failed to find artifacts by filing ID'));
    }
  }

  async findByType(type: string): Promise<Result<Artifact[], Error>> {
    try {
      const result = await idb.getAllByIndex<Artifact>('artifacts', 'type', type);
      if (!result.ok) throw result.error;
      const reconstructed = result.value.map((a: Artifact) => Artifact.reconstruct(a));
      reconstructed.sort((a: Artifact, b: Artifact) => b.timestamp.getTime() - a.timestamp.getTime());
      return Ok(reconstructed);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error('Failed to find artifacts by type'));
    }
  }

  async getHistory(artifactId: string): Promise<Result<Array<{ version: number; data: unknown; timestamp: Date }>, Error>> {
    try {
      const result = await idb.get<Artifact>('artifacts', artifactId);
      if (!result.ok) throw result.error;
      if (!result.value) return Ok([]);
      return Ok([{ version: result.value.version, data: result.value.data, timestamp: result.value.timestamp }]);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error('Failed to get artifact history'));
    }
  }

  async delete(id: string): Promise<Result<boolean, Error>> {
    try {
      await idb.delete('artifacts', id);
      return Ok(true);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error('Failed to delete artifact'));
    }
  }
}
