# Auditoría de Estilo Visual, Presentación de Datos y Funcionalidad UX (`tariffos.app`)

**Producto:** TariffOS — Plataforma de Clasificación y Pre-Auditoría Arancelaria con IA  
**Etapa actual del negocio:** Desarrollo avanzado / Pre-lanzamiento comercial con primeros clientes B2B  
**Enfoque del documento:** Estética visual, arquitectura de datos aduaneros, comportamiento interactivo de componentes y conversión comercial  

---

## 1. Puntuación de la Landing Page ($1$ al $10$)

### Calificación Global Actual: **$5.2\text{ / }10$** *(Nivel: En Desarrollo — Estética atractiva, pero desconectada del comprador experto)*

La página aprueba en limpieza visual moderna, pero reprueba en **demostración tangible del software** y en **ergonomía cognitiva para el sector aduanero**. A primera vista luce como una startup tecnológica pulida; al analizarla como herramienta de trabajo para un Agente de Aduanas, un clasificador merceológico o un Gerente de Importaciones, transmite la sensación de una plantilla genérica de IA sin evidencia visual de que la aplicación exista por dentro.

| Criterio de Diseño y UX | Puntaje | Diagnóstico Directo |
| :--- | :---: | :--- |
| **1. Estética y Pulido Visual Base** | **$7.0\text{ / }10$** | Buena jerarquía espacial, ritmo limpio de secciones y estética moderna tipo *SaaS AI*. |
| **2. Adecuación de Estilo al Comprador Aduanero** | **$4.5\text{ / }10$** | Usa códigos visuales de herramientas para programadores (`ai-terminal`) en vez de códigos visuales de rigor legal, documental y fiscal. |
| **3. Presentación y Visualización de la Data** | **$3.5\text{ / }10$** | No muestra ni un solo código NCM real desglosado, ni una ficha técnica analizada, ni un expediente auditable. Métricas apiladas sin contexto. |
| **4. Funcionalidad de Componentes e Interactividad** | **$4.5\text{ / }10$** | Botones *"Saber más"* sin utilidad real, carrusel repetitivo sin interacción y ausencia total de prueba interactiva del producto. |
| **5. Flujo de Conversión para Salida a Mercado** | **$4.5\text{ / }10$** | Un formulario de *"lista de espera"* de un solo campo contradice que la app ya esté en desarrollo avanzado lista para recibir clientes. |

---

## 2. Auditoría del Estilo Visual: El choque entre "AI-DevTools" y "CustomsTech"

### 2.1. El problema estético central: Parecer "consola de código" en vez de "sistema de certeza jurídica"
El diseño actual adopta el arquetipo popularizado por herramientas para desarrolladores (tipo *Vercel*, *Linear* o *Cursor*): estéticas minimalistas oscuras o de alto contraste tecnológico, insignias tipo píldora luminosa y un contenedor rotulado **`tariffos.app / ai-terminal`**.

* **Por qué resta ventas en tu nicho:** Un desarrollador ama una terminal porque significa control; un especialista aduanero o director financiero desconfía de una "terminal de IA" porque le sugiere algo experimental, críptico o propenso a alucinar. En comercio exterior y tributos, el diseño visual debe transmitir **orden institucional, trazabilidad documental y precisión quirúrgica** (más cercano a *Stripe Tax*, *Vanta* o *Harvey AI*).

### 2.2. Sistema Tipográfico Recomendado
En una plataforma arancelaria conviven dos mundos: **lectura jurídica densa** (notas legales, descripciones merceológicas) y **datos alfanuméricos estrictos** (partidas de $10$ dígitos, porcentajes de tributos, números de Gaceta).
* **Títulos y Cuerpo de Interfaz:** Mantener una *sans-serif* geométrica/neo-grotesca de alta legibilidad como **Inter**, **Plus Jakarta Sans** o **Geist Sans**, evitando pesos excesivamente finos en párrafos secundarios para no cansar la vista de usuarios corporativos que trabajan en monitores de oficina estándar.
* **Datos Arancelarios y Tributarios (Regla Obligatoria):** Usar una fuente **Monospace con números tabulares** (`JetBrains Mono` o `IBM Plex Mono` con la propiedad CSS `font-variant-numeric: tabular-nums`) **exclusivamente** para:
  * Códigos NCM segmentados por puntos: `8471.30.12.00`
  * Alícuotas y tributos: `Ad-Valorem: 12%` | `IVA: 16%` | `Tasa: 1%`
  * Referencias legales e identificadores de auditoría: `G.O.E. 6.804` | `RL-09` | `RGI 1 + RGI 6`
  * *Efecto psicológico:* Al aislar los códigos y porcentajes en tipografía monoespaciada dentro de etiquetas sutiles, la página pasa inmediatamente de parecer un blog de marketing a parecer software fiscal de alta precisión.

### 2.3. Paleta de Color Funcional (Semáforo Regulatorio)
En *Compliance*, el color no debe usarse como adorno neón, sino como **lenguaje de estado aduanero**:
* **Superficie Principal:** Si tu app real opera muchas horas al día en oficinas aduanales (donde se leen PDFs blancos de facturas y gacetas a la par), evalúa usar un **Modo Claro Técnico** (blancos rotos `#F8FAFC`, bordes grises finos `#E2E8F0`, texto pizarra profundo `#0F172A`) con bloques puntuales en azul marino profundo (`#0B1120`) para contraste ejecutivo, en lugar de un modo oscuro absoluto que dificulta integrar capturas de documentos reales.
* **Colores Semánticos de Datos:**
  * **Verde Esmeralda (`#059669`):** Libre importación / Exoneración activa verificada / Confianza merceológica alta.
  * **Ámbar Preventivo (`#D97706`):** Alerta de **Régimen Legal obligatorio** previo al embarque (ej. Permiso Sanitario, SENCAMER, Certificado COMEX) o dato técnico faltante en la ficha.
  * **Rojo Crítico (`#DC2626`):** Mercancía de importación prohibida / Riesgo de sanción LOA / Discrepancia entre factura comercial y ficha técnica.
  * **Azul Institucional (`#2563EB`):** Citas normativas, enlaces a Notas Explicativas OMA y acción primaria.

---

## 3. Cómo Presentar la Data en la Landing Page

Actualmente la landing **cuenta con palabras** lo que hace la IA, pero **no enseña datos estructurados**. Como tu aplicación ya está en desarrollo avanzado, tu mayor ventaja competitiva frente a cualquier promesa de humo es **mostrar la anatomía real de tus datos**.

### 3.1. Reemplazar `ai-terminal` por un "Inspector Dividido de Entrada $\rightarrow$ Salida"
En el Hero (o inmediatamente debajo), sustituye el concepto de terminal por una ventana de aplicación dividida en dos columnas conectadas visualmente:

* **Columna Izquierda (El Caos de Entrada — Documento Real):**
  * Muestra el fragmento visual de una **Ficha Técnica / MSDS real en inglés** (por ejemplo, una bomba centrífuga industrial o un polímero químico).
  * Resalta con recuadros de color (*bounding boxes*) los $3$ atributos clave que el motor extrajo automáticamente: `Material constitutivo`, `Principio de funcionamiento / Potencia` y `Uso técnico`.
* **Columna Derecha (El Orden de Salida — Expediente TariffOS):**
  * **Árbol Jerárquico del Código (Visualización Progresiva):** No muestres `8413708900` de corrido; preséntalo desglosado para que un clasificador vea que tu motor razona como humano:
    * `Cap. 84` (Reactores nucleares, calderas, máquinas...)
    * `Partida 84.13` (Bombas para líquidos...)
    * `Subpartida 8413.70` (Las demás bombas centrífugas)
    * `NCM 10 Dígitos` $\rightarrow$ **`8413.70.90.00`** *(Resaltado principal con botón de copiar)*
  * **Fila de Píldoras Tributarias y Para-arancelarias:**
    * `[Ad-Valorem: 14%]` · `[Unidad Física: u]` · `[Régimen Legal: Sin RL / o RL Aplicable]` · `[Exoneración: Sujeto a validación Decreto vigente]`
  * **Bloque de Sustento Jurídico Auditable:**
    * Un recuadro compacto citando: *"Fundamentación: Aplicación de RGI 1 (Texto de la partida 84.13 y Nota 2 de la Sección XVI) y RGI 6..."*.

### 3.2. Rediseño de las Métricas en "El Costo del Error"
En la versión actual, el texto renderiza bloques pegados como `MULTAS FISCALESHasta 200%` o `INCONSISTENCIA80% Factor Humano`, donde etiquetas y valores compiten sin contexto documental.

* **Cómo estructurar cada tarjeta de datos de riesgo:**
  1. **Etiqueta superior en mayúsculas pequeñas (*Kicker*):** `IMPACTO SANCIONATORIO · ART. 168 LOA`
  2. **Dato protagonista aislado:** `$200\%$` *(tributos diferenciales)* + `$550\text{ TCMMV}$` *(multa agencia)*
  3. **Micro-barra visual o comparativa concreta:** Mostrar en una línea gris al pie qué pasa en la vida real: *"En un embarque CIF de $\$40.000$ mal clasificado, un salto arancelario del $12\%$ más multa compromete más de $\$14.000$ en caja y frena el despacho"*.
* **Por qué funciona mejor:** Pasas de porcentajes genéricos de infografía a **matemática financiera de importación**, que es lo que convence al dueño de la carga o al gerente general de aprobar la compra del software.

### 3.3. Mostrar el "Detector de Vacíos Técnicos" como Dato Diferenciador
Dedica una tarjeta visual específica a mostrar **qué hace la app cuando un PDF es ambiguo** (por ejemplo, una factura que solo dice *"Válvula industrial acople rápido"*).
* Muestra una tarjeta de interfaz con borde ámbar:
  * **Estado:** `Clasificación retenida preventivamente — Precisión actual: 62%`
  * **Acción requerida al proveedor:** *"Para definir entre `8481.80.95.00` y `8481.80.99.00`, confirme material del cuerpo (acero forjado vs. bronce) y presión nominal de trabajo en $\text{bar}$."*
* **Efecto en el cliente:** Cualquier clasificador aduanero que vea esa pantalla en tu landing dirá de inmediato: *"Quien programó esto entiende de verdad cómo se clasifica en aduana"*.

---

## 4. Cómo Deberían Funcionar los Elementos (Guía de Interactividad UX)

Dado que vas a salir pronto con clientes reales, cada elemento interactivo debe eliminar fricción, demostrar madurez del producto y filtrar prospectos serios.

### 4.1. Barra de Navegación Superior (`Navbar`)
* **Estado actual:** Tiene `Características`, `Cómo funciona` y `Únete a la lista`.
* **Cómo debe funcionar ahora:**
  * Fija en la parte superior al hacer *scroll* (`sticky top-0`) con desenfoque sutil (`backdrop-blur`).
  * Navegación: `Producto` | `Cobertura Legal` | `Flujo de Trabajo` | `Seguridad`.
  * **Zona derecha con doble acción (Señal de Producto Real):**
    * Enlace secundario discreto: **`Acceso Clientes`** (dirigido a `app.tariffos.app/login` o entorno privado). *Truco clave de conversión B2B:* Ver un botón de inicio de sesión real le confirma psicológicamente al comprador que la plataforma ya existe y está operando con usuarios activos.
    * Botón primario sólido: **`Agendar Demo`** o **`Solicitar Acceso Comercial`**.

### 4.2. Componente Principal del Hero: Selector Interactivo de $3$ Casos Reales (Tabs)
* **Cómo debe funcionar:** En lugar de una imagen muerta o animación decorativa, coloca **tres pestañas clicables** encima del visor del producto:
  * `[ 1. Maquinaria y Repuestos ]` · `[ 2. Químicos / Hojas MSDS ]` · `[ 3. Electrónica y Telecom ]`
* Al hacer clic en cualquiera de las tres pestañas, cambia instantáneamente el documento de ejemplo a la izquierda y el dictamen arancelario a la derecha (puedes alimentarlo con un JSON estático en la landing extraído de salidas reales de tu app, sin gastar tokens de IA en vivo ni exponer tu backend público).

### 4.3. Cinta de Credenciales (`Marquee` Normativo)
* **Estado actual:** Un carrusel infinito que triplica en el código los mismos $4$ textos (incluyendo el erróneo Decreto 4.907) sin ninguna utilidad funcional.
* **Cómo debe funcionar:**
  * Mejor convertirlo en una **Barra Estática de Estado Normativo (Live Regulatory Status Bar)** de $4$ columnas limpias, o si mantienes movimiento suave, **pausar obligatoriamente en `hover`**.
  * Hacer que al pasar el cursor sobre cada insignia se despliegue un **Popover / Tooltip técnico**: por ejemplo, al pasar sobre `Arancel NCM Vigente`, el *tooltip* muestra: *"Sincronizado con Decreto N° 4.944 y sus reformas parciales vigentes hasta Gaceta Oficial 2026"*.

### 4.4. Grilla de Funcionalidades (Bento Grid) y eliminación de los botones `Saber más`
* **Estado actual:** $4$ tarjetas simétricas de texto donde cada una termina con un enlace **`Saber más`** que no lleva a páginas profundas ni resuelve dudas. Eso genera frustración (*false affordance*) y distrae de la conversión.
* **Cómo debe funcionar:**
  * **Elimina todos los enlaces `Saber más`.** La tarjeta debe explicarse por sí sola visualmente.
  * Usa un diseño **Bento Grid asimétrico** ($2$ tarjetas anchas de $60\%$ y $2$ tarjetas de $40\%$) donde cada bloque incluya un **micro-componente UI real** de tu aplicación:
    1. *Tarjeta Análisis PDF:* Mini-vista de tabla extrayendo $25$ ítems de un catálogo multipágina.
    2. *Tarjeta Radar de Regímenes Legales:* Píldoras visuales mostrando alerta temprana de `RL 9 - Certificado COMEX` o `RL 12 - SENCAMER`.
    3. *Tarjeta Sustento RGI:* Vista colapsable real de la justificación legal lista para copiar o descargar en PDF.
    4. *Tarjeta Historial Inmutable:* Línea de tiempo (`Audit Log`) con usuario, fecha, hash del documento fuente y versión de Gaceta aplicada.

### 4.5. Sección "Cómo Funciona" ($3$ Pasos) $\rightarrow$ *Stepper* Interactivo
* **Estado actual:** Tres bloques numerados `1`, `2`, `3` puramente textuales.
* **Cómo debe funcionar:**
  * Diseña un **Stepper lateral interactivo**: a la izquierda están los pasos $1$, $2$ y $3$ clicables (con una barra de progreso activa), y a la derecha una ventana ancha que muestra **la captura real de tu aplicación en ese paso exacto**:
    * Clic en *Paso 1 (Carga documental)* $\rightarrow$ Muestra tu pantalla real de *Drag & Drop* aceptando PDFs, Excel de *packing list* y hojas técnicas.
    * Clic en *Paso 2 (Motor Merceológico)* $\rightarrow$ Muestra la pantalla de extracción de atributos técnicos y validación de posibles ambigüedades.
    * Clic en *Paso 3 (Expediente Auditable)* $\rightarrow$ Muestra el reporte final descargable y exportable para el equipo de aduanas.

### 4.6. Formulario de Cierre y Conversión (Transición de "Waitlist" a "Despliegue Comercial")
* **El problema actual:** Pedir únicamente un correo con un botón que dice **`Únete`** funciona cuando apenas tienes una idea en papel. Cuando ya estás a punto de salir con clientes B2B, ese flujo tiene dos defectos graves:
  1. Te llena la base de datos de correos `@gmail.com` de curiosos o competidores sin contexto comercial.
  2. Un gerente de operaciones que ya tiene carga en tránsito siente que "lo mandaron a una cola sin fecha" y cierra la pestaña.
* **Cómo debe funcionar tu nuevo flujo de conversión en $2$ pasos sin fricción:**
  * **Paso 1 (En la propia página — Baja fricción):** Input de correo corporativo + Botón claro: **`Solicitar Demo y Prueba con mis SKUs`**.
  * **Paso 2 (Modal instantáneo tras pulsar el botón — Calificación de Oro):**
    * *"¡Recibido! Para preparar tu sesión con casos reales de tu operación, cuéntanos en $15$ segundos:"*
    * **Selector 1 (Tipo de empresa):** `[ Agencia de Aduanas ]` · `[ Empresa Importadora ]` · `[ Consultora / Operador Logístico ]`
    * **Selector 2 (Volumen aproximado):** `[ 1–50 ítems/mes ]` · `[ 50–300 ítems/mes ]` · `[ +300 ítems/mes ]`
    * **Opción estrella (*Killer Feature* comercial):** *"¿Quieres ver TariffOS clasificando uno de tus productos reales en la llamada? (Opcional: adjunta $1$ ficha técnica PDF o indícanos el rubro)"*.
  * Con este flujo, aunque el usuario cierre en el Paso 2 ya capturaste su correo en el Paso 1; y quienes completen el Paso 2 entran a tu primera reunión de ventas prácticamente cerrados.

---

## 5. Checklist Rápido de Higiene UI/UX antes de Lanzar Tráfico

1. **Espaciado en métricas (`El Costo del Error`):** Corregir el colapso visual entre la etiqueta de categoría y el número (`MULTAS FISCALES` separado claramente con `gap-2` o salto de bloque respecto a `Hasta 200%`).
2. **Responsividad móvil ejecutiva:** Muchos dueños de agencias aduanales e importadores abrirán el enlace de `tariffos.app` desde **WhatsApp en el teléfono**. El componente dividido del Hero debe apilarse verticalmente en móvil sin romper márgenes horizontales ni recortar códigos de $10$ dígitos.
3. **Enlaces legales funcionales:** El texto *"Política de Privacidad"* bajo ambos formularios debe abrir una vista real enfocada en **reserva y confidencialidad de documentos mercantiles**, no un enlace vacío `#`.
4. **Año y pie corporativo:** Sustituir el frío `© 2026 TariffOS, Inc.` por un *footer* de $3$ columnas con descripción breve del producto, correo directo de soporte/ventas (`contacto@tariffos.app`), acceso de clientes registrados y nota explícita de cobertura normativa nacional.