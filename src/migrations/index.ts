import * as migration_20260901_160631 from './20260901_160631';

export const migrations = [
  {
    up: migration_20260901_160631.up,
    down: migration_20260901_160631.down,
    name: '20260901_160631'
  },
];
