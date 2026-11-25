/**
 * InMemoryArtifactRepository - in-memory implementation of IArtifactRepository.
 * Stores artifacts in a Map<string, Artifact> with a per-artifact version history.
 */

import { Artifact } from '@/domain/entities/Artifact';
import { ArtifactType } from '@/domain/entities/Artifact';
import { IArtifactRepository } from '@/domain/repositories';
import { Result, Ok, Err } from '@/domain/Result';

const SIMULATED_IO_DELAY_MS = 10;

type ArtifactSnapshot = { version: number; data: unknown; timestamp: Date };

async function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, SIMULATED_IO_DELAY_MS));
}

export class InMemoryArtifactRepository implements IArtifactRepository {
  private readonly store = new Map<string, Artifact>();
  private readonly history = new Map<string, ArtifactSnapshot[]>();

  async save(artifact: Artifact): Promise<Result<void, Error>> {
    await delay();
    const existing = this.store.get(artifact.id);
    if (existing) {
      this.history.get(artifact.id)?.push(existing.getVersionSnapshot());
    } else {
      this.history.set(artifact.id, []);
    }
    this.store.set(artifact.id, Artifact.reconstruct(artifact.toSnapshot()));
    return Ok(undefined);
  }

  async findById(id: string): Promise<Result<Artifact | null, Error>> {
    await delay();
    const artifact = this.store.get(id);
    return Ok(artifact ? Artifact.reconstruct(artifact.toSnapshot()) : null);
  }

  async findByFilingId(filingId: string): Promise<Result<Artifact[], Error>> {
    await delay();
    const results = Array.from(this.store.values()).filter((a) => a.filingId === filingId);
    return Ok(results.map((a) => Artifact.reconstruct(a.toSnapshot())));
  }

  async findByType(type: ArtifactType): Promise<Result<Artifact[], Error>> {
    await delay();
    const results = Array.from(this.store.values()).filter((a) => a.type === type);
    return Ok(results.map((a) => Artifact.reconstruct(a.toSnapshot())));
  }

  async getHistory(
    artifactId: string
  ): Promise<Result<ArtifactSnapshot[], Error>> {
    await delay();
    if (!this.store.has(artifactId)) {
      return Err(new Error(`Artifact not found: ${artifactId}`));
    }
    return Ok([...(this.history.get(artifactId) ?? [])]);
  }

  async delete(id: string): Promise<Result<boolean, Error>> {
    await delay();
    const existed = this.store.has(id);
    this.store.delete(id);
    this.history.delete(id);
    return Ok(existed);
  }
}
