import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { env } from '../config/env.js';
const empty = () => ({ users: [], projects: [], sprints: [], todos: [] });
/**
 * A tiny JSON-file database. All reads/writes happen in memory; every
 * `write()` schedules an atomic flush to disk (write temp file → rename).
 * Good enough for a single-process dev server.
 */
class JsonStore {
    file = resolve(env.DATA_FILE);
    flushing = Promise.resolve();
    dirty = false;
    data;
    constructor() {
        mkdirSync(dirname(this.file), { recursive: true });
        this.data = existsSync(this.file) ? { ...empty(), ...JSON.parse(readFileSync(this.file, 'utf8')) } : empty();
    }
    /** Mutate data, then persist. Returns whatever the mutator returns. */
    write(mutate) {
        const result = mutate(this.data);
        this.scheduleFlush();
        return result;
    }
    /** Replace everything (used by the seed script). */
    reset(data = empty()) {
        this.data = data;
        this.scheduleFlush();
    }
    /** Resolves once everything written so far is on disk. */
    async flush() {
        await this.flushing;
    }
    scheduleFlush() {
        if (this.dirty)
            return;
        this.dirty = true;
        this.flushing = this.flushing.then(async () => {
            this.dirty = false;
            const tmp = `${this.file}.tmp`;
            await writeFile(tmp, JSON.stringify(this.data, null, 2));
            await rename(tmp, this.file);
        });
    }
}
export const db = new JsonStore();
//# sourceMappingURL=store.js.map