import type { Config } from 'jest';
import { createCjsPreset } from 'jest-preset-angular/presets/index.js';

export default {
    ...createCjsPreset(),
    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts']
} satisfies Config;
