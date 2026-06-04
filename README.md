# MyProgress

App web para registrar entrenamientos de gimnasio: rutinas, series, pesos, calendario y progreso. Funciona como **PWA** (instalable en el celular) y guarda los datos en el dispositivo.

## Tecnologías

- [React 19](https://react.dev/) + [Vite 8](https://vite.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/) (iconos)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) + Workbox (service worker y caché offline)

## Requisitos

- Node.js 18 o superior
- npm

## Comandos

```bash
# Instalar dependencias
npm install

# Desarrollo (http://localhost:5173)
npm run dev

# Compilar para producción
npm run build

# Vista previa del build
npm run preview

# Linter
npm run lint

# Regenerar iconos PWA desde public/icons/myprogress-icon.svg
npm run generate-pwa-icons
```

## Despliegue (Netlify u otro hosting)

1. Ejecutá `npm run build`.
2. Publicá el contenido de la carpeta **`dist`**.
3. Usá siempre la **misma URL** para que los usuarios no pierdan datos guardados en el celular.
4. En iOS: Safari → Compartir → **Agregar a inicio**.

Los datos viven en `localStorage` del navegador, no en el servidor. Subir una versión nueva **no borra** el progreso del usuario si la URL no cambia.

## Estructura del proyecto

```
MyProgressApp/
├── public/
│   ├── manifest.json          # Configuración PWA
│   ├── icon-192.jpeg          # Icono instalable
│   ├── icon-512.jpeg
│   └── icons/                 # SVG del logo
├── scripts/
│   └── generate-pwa-icons.mjs # Genera pwa-192x192.png y pwa-512x512.png
└── src/
    ├── App.jsx                # Shell: layout + tabs + modales
    ├── main.jsx               # Entrada React + registro del service worker
    ├── sw.js                  # Service worker (Workbox injectManifest)
    ├── index.css              # Estilos globales + animaciones (confeti, scroll)
    │
    ├── hooks/
    │   └── useGymApp.js       # Estado, efectos, lógica de negocio
    │
    ├── constants/
    │   ├── muscles.js         # Grupos musculares del catálogo
    │   ├── defaults.js        # Catálogo inicial y rutinas vacías A/B/C
    │   └── storageKeys.js     # Claves de localStorage
    │
    ├── utils/
    │   ├── date.js            # Fechas en formato local (YYYY-MM-DD)
    │   ├── storage.js         # Lectura segura de localStorage
    │   └── calendar.js        # Generación del calendario horizontal
    │
    ├── services/
    │   └── audio.js           # Sonidos del timer y celebración al completar el día
    │
    ├── components/
    │   ├── brand/MyProgressLogo.jsx
    │   ├── workout/RestTimer.jsx, WorkoutCelebration.jsx
    │   ├── charts/SimpleLineChart.jsx
    │   └── layout/AppBackground.jsx, AppHeader.jsx, BottomNav.jsx
    │
    ├── features/              # Pantallas por pestaña del menú inferior
    │   ├── workout/WorkoutTab.jsx   # Home: entrenar del día
    │   ├── edit/EditRoutineTab.jsx    # Editar rutinas y ejercicios
    │   ├── library/LibraryTab.jsx   # Catálogo de ejercicios
    │   └── stats/StatsTab.jsx       # Gráficos de evolución
    │
    └── modals/
        ├── DeleteRoutineModal.jsx
        ├── MultiSelectModal.jsx     # Agregar ejercicios del catálogo a una rutina
        └── FullCalendarModal.jsx
```

## Arquitectura

```
main.jsx
   └── App.jsx
          ├── useGymApp()          ← cerebro de la app
          ├── AppHeader            ← calendario, rutinas, barra de progreso
          ├── WorkoutTab | EditRoutineTab | LibraryTab | StatsTab
          ├── Modales
          └── BottomNav
```

`useGymApp` devuelve un objeto `app` con estado, refs, handlers y valores calculados. Los componentes hijos reciben `app` como prop (por ejemplo `<WorkoutTab app={app} />`).

## Dónde editar cada cosa

| Quiero cambiar… | Archivo |
|-----------------|---------|
| Pantalla de entrenamiento (home) | `src/features/workout/WorkoutTab.jsx` |
| Edición de rutinas | `src/features/edit/EditRoutineTab.jsx` |
| Catálogo de ejercicios | `src/features/library/LibraryTab.jsx` |
| Estadísticas / gráficos | `src/features/stats/StatsTab.jsx` |
| Header (calendario, rutinas, progreso) | `src/components/layout/AppHeader.jsx` |
| Menú inferior | `src/components/layout/BottomNav.jsx` |
| Lógica, guardado, celebración | `src/hooks/useGymApp.js` |
| Datos por defecto al instalar | `src/constants/defaults.js` |
| Claves de localStorage | `src/constants/storageKeys.js` |
| Sonidos | `src/services/audio.js` |
| Estilos globales / confeti | `src/index.css` |
| PWA (nombre, iconos, colores) | `public/manifest.json` |

## Persistencia de datos (localStorage)

| Clave | Contenido |
|-------|-----------|
| `myprogress_theme_pref` | Tema claro / oscuro |
| `myprogress_lib_v27` | Catálogo de ejercicios |
| `myprogress_blocks_v28` | Bloques de rutina (A, B, C…) |
| `myprogress_routines_v28` | Ejercicios por rutina |
| `myprogress_diary_v28` | Registro diario (pesos, reps, completados) |
| `myprogress_hist_v28` | Historial para autocompletar series |

Al iniciar, se eliminan las claves legacy `v27` de bloques/rutinas/diario para evitar mezclar datos viejos con la versión actual.

## Funcionalidades principales

- **Home**: calendario, selector de rutina, barra de progreso del día, registro de series y pesos.
- **Rutina**: crear/editar rutinas, agregar ejercicios desde el catálogo, archivar rutinas.
- **Catálogo**: ABM de ejercicios por grupo muscular.
- **Estadísticas**: gráficos de peso máximo por ejercicio (mínimo 2 sesiones).
- **Timer** de descanso flotante (arrastrable).
- **Celebración** al completar todos los ejercicios del día (confeti + sonido, una vez por día/rutina).

## PWA y actualizaciones

- El service worker actualiza la app en segundo plano (`autoUpdate`).
- Los usuarios **no necesitan** volver a “Agregar a inicio” si la URL es la misma.
- Si cambiás de dominio o URL, los datos anteriores quedan en el origen viejo.

## Licencia

Proyecto privado.
