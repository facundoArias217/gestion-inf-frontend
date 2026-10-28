# Informe de ejecución — Tareas A4/A5 [FE-mock] Specs e imagen del catálogo (mock-first)

**Tareas:** A4 (cards con imagen/ícono por categoría + detalle con tabla de specs) y A5 (filas clave-valor dinámicas + importación .txt) del plan FRONT (Fase 2 / comi-rapi), ejecutadas juntas como pre-work mock-first de la tarjeta 15.6 [FE] (Bloque B2)
**Tipo:** [FE-mock] · **Fecha:** 28/10/2026 · **Repositorio:** gestion-inf-frontend · **Rama:** `fe/catalogo-specs-mock`

## Alcance ejecutado

Contrato espejado del trabajo en curso del BACK (tarjeta 15.5, sin commit al momento de esta ejecución): validators y seeders de `be/fase2` → RFN-23 (categorías `clave`/`obligatoria`) y RFN-24 (specs en dos capas: 4 columnas fijas de compatibilidad + `especificaciones` JSONB `[{grupo, items:[{clave,valor}]}]` máx 10×30, solo exhibición + `imagenUrl`). Sin cambios de integración: `integration.js` intacto, todo funciona contra mocks.

- **`features/categorias/mocks.js`**: `clave` + `obligatoria` en las 18 categorías, valores idénticos a los seeds del backend (`procesador`, `motherboard`, `memoria_ram`, `placa_video`, `almacenamiento`, `fuente`, `gabinete`, `perifericos`, `refrigeracion`; `null` en el resto).
- **`features/productos/mocks.js`**: `imagenUrl`, `socket`, `tipoMemoria`, `graficosIntegrados`, `incluyeCooler` y `especificaciones` en los 9 productos sembrados con specs (ids 1–7, 20, 23), espejo exacto de los seeds. Las `imagenUrl` apuntan a `/uploads/productos/demo-*.png`, que no existen en el FE: las cards ejercitan el fallback a ícono por categoría (comportamiento 15.1).
- **`features/productos/services.js`**: `crearMock`/`actualizarMock` persisten `imagenUrl` y `especificaciones` (copia profunda para que el store no comparta referencias).
- **`components/especificaciones-editor.jsx`** (nuevo, feature productos): editor por grupos con filas clave-valor dinámicas (field arrays anidados de react-hook-form), límites espejo del validator (10 grupos × 30 filas, clave ≤100, valor ≤200, grupo ≤100) y **importación .txt client-side**: encabezados de grupo entre corchetes (`[Conectividad]`), filas `clave: valor` (también acepta `=`), items sin grupo van a «General», grupos deduplicados case-insensitive, líneas no reconocidas se ignoran y se informan en el toast.
- **`producto-form-dialog.jsx`**: campos `imagenUrl` (validación espejo: URL absoluta o `/uploads/…`, máx 500) y `especificaciones` vía editor; payload envía trim y `null` cuando van vacíos; diálogo ensanchado a `sm:max-w-2xl`.
- **`armados/components/producto-detalle-dialog.jsx`** (A4): además de las 4 specs fijas (ahora bajo el título «Compatibilidad»), renderiza los grupos de `especificaciones` como secciones con filas clave-valor (ficha estilo Compragamer).

## Decisiones tomadas

1. **Mock-first espejando el working tree del BACK**: el shape salió de los validators/seeders de 15.5 sin commitear. Si al commitear 15.5 el contrato cambia, se ajusta acá antes de la 15.6 (B2); el riesgo es bajo porque RFN-23/24 ya están documentadas en la skill del backend.
2. **La importación .txt reemplaza** las especificaciones cargadas a mano (no mergea): predecible para el caso de uso principal (cargar la ficha del proveedor de una vez); el toast informa grupos, filas y líneas ignoradas. Si el archivo no tiene líneas reconocibles, no toca nada y muestra error.
3. **El editor es de exhibición, no de compatibilidad**: los 4 campos estructurados (socket, tipoMemoria, gráficos, cooler) NO se agregan al form en esta tarea — entran con la 15.6 (B2) junto con la validación real del backend (15.7). El editor no interviene en ninguna validación (RFN-24).
4. **`compatibilidad.js` intacto**: sigue inferiendo socket/memoria por texto (keywords del nombre/descripción) y solo emite advertencias informativas; los mocks con specs no cambian su comportamiento ni pueden bloquear guardar.
5. **Specs como `null` cuando están vacías** (contrato Joi `.allow(null)`), nunca `[]`.
6. El detalle del wizard reutiliza el mismo contrato que recibirá 15.8 (B3): al integrar specs reales no habrá que reescribir el render, solo cambia la fuente de datos.

## Verificación

- `npm run lint` OK (sin warnings).
- `npm run build` OK (warning preexistente de tamaño de chunk, sin errores).
- Sin cambios en `integration.js`, `router.jsx` ni guards; los mocks respetan el shape del validator de 15.5.

## Checklist manual pendiente

- Productos: editar «AMD Ryzen 5 7600» → el form trae imagen, specs fijas visibles en el detalle y 2 grupos de especificaciones con sus filas.
- Productos: alta nueva → «Agregar grupo» con 2 filas → guardar → editar de nuevo y verificar persistencia del mock.
- Productos: «Agregar grupo» sin nombre ni filas completas → Guardar → mensajes zod por campo.
- Productos: importar un .txt con encabezados `[Grupo]`, líneas `clave: valor`, una línea sin separador y una con solo clave → toast con conteo; verificar grupos y líneas ignoradas.
- Productos: importar el mismo .txt dos veces → reemplaza (no duplica).
- Productos: URL inválida en imagen (`foo`) → mensaje zod; con `https://…` o `/uploads/…` pasa.
- Wizard armado: ver detalle del Ryzen → aparece «Compatibilidad» (4 campos) + grupos CARACTERÍSTICAS GENERALES y REFRIGERACIÓN; card del Ryzen intenta mostrar `/uploads/...` y cae al ícono CPU.
- Wizard armado: productos sin specs (ej. RX 7600) → detalle sin secciones de specs.
- Categorías: los mocks traen `clave`/`obligatoria` (uso futuro en 15.6/15.8; hoy ninguna pantalla las consume).
