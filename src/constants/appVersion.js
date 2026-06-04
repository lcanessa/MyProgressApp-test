import packageJson from '../../package.json';

/** Etiqueta corta para UI, ej. "1.0.0" → "v1.0" */
export function getAppVersionLabel(version = packageJson.version) {
  const [major = '0', minor = '0'] = String(version).split('.');
  return `v${major}.${minor}`;
}

export const APP_VERSION = packageJson.version;
export const APP_VERSION_LABEL = getAppVersionLabel();
