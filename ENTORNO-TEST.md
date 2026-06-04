# MyProgress — entorno de prueba

Copia del proyecto de **producción** (`MyProgressApp`). Usá esta carpeta para probar cambios sin tocar lo que publicás en Netlify.

## Carpetas

| Carpeta | Uso |
|---------|-----|
| `c:\Mis Proyectos\MyProgressApp` | **Producción** — la que subís a Netlify |
| `c:\Mis Proyectos\MyProgressApp-test` | **Test** — experimentos y validación |

## Comandos

```powershell
cd "c:\Mis Proyectos\MyProgressApp-test"
npm install
npm run dev
```

Abre **http://localhost:5174** (producción suele usar 5173).

## Diferencias con producción

- Nombre de la app: **MyProgress Test** (PWA / título).
- `localStorage` con prefijo `myprogress_test_*` (no pisa tus datos reales).
- Puerto de desarrollo **5174**.

## Subir a Netlify (otra URL)

### Opción A — Con GitHub (recomendado)

1. Creá un repo vacío en GitHub: **MyProgressApp-test** (sin README).
2. En PowerShell:

```powershell
cd "c:\Mis Proyectos\MyProgressApp-test"
git remote add origin https://github.com/lcanessa/MyProgressApp-test.git
git push -u origin main
```

3. En [Netlify](https://app.netlify.com) → **Add new site** → **Import from Git**.
4. Elegí el repo **MyProgressApp-test**.
5. Netlify detecta `netlify.toml`:
   - Build: `npm run build`
   - Publish: `dist`
6. **Deploy**. Te da una URL tipo `https://algo-random.netlify.app`.
7. Opcional: **Domain settings** → cambiar el subdominio (ej. `myprogress-test.netlify.app`).

### Opción B — Solo carpeta `dist` (manual)

```powershell
cd "c:\Mis Proyectos\MyProgressApp-test"
npm run build
```

En Netlify → **Add new site** → **Deploy manually** → arrastrá la carpeta `dist`.

Para actualizar, volvé a hacer `npm run build` y subí `dist` de nuevo.

### Producción vs test

| Sitio | Carpeta local | URL Netlify |
|-------|----------------|-------------|
| Producción | `MyProgressApp` | la que ya tenés |
| Test | `MyProgressApp-test` | la nueva URL |

No mezclan datos: test usa `myprogress_test_*` en el navegador.

## Flujo recomendado

1. Cambiá y probá acá en **test**.
2. Cuando esté bien, copiá los mismos cambios a **MyProgressApp** (producción) o hacé merge si usás git en ambos.
