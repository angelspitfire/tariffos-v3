# Guía Operativa Pre-Lanzamiento: Auditoría de Landing y Verificación Funcional de la App (`TariffOS`)

**Contexto del proyecto:** Aplicación en desarrollo avanzado próxima a salir a producción con primeros clientes reales.  
**Objetivo doble del documento:**  
1. **Alinear el Landing (`tariffos.app`):** Ajustar cada promesa comercial a lo que el producto realmente ejecuta hoy y reflejar una etapa de **Despliegue Comercial / Onboarding de Clientes**, eliminando la imagen de "lista de espera indefinida".  
2. **Auditar la App antes de entregar accesos:** Verificar mediante un checklist técnico, legal y de ingeniería que el software cumpla sin fisuras lo que promete en pantalla, evitando errores frente a agencias de aduanas e importadores.

---

## Parte 1: Ajuste Estratégico del Landing para Salida con Clientes

Cuando un software B2B está en **desarrollo avanzado y a punto de operar con primeros clientes**, poner *"Únete a la lista de espera"* frena ventas reales (parece que el producto aún es solo una idea), mientras que dejar *"Ya está disponible"* sin acceso directo genera frustración.

### 1.1. Cambio del Modelo de Conversión en el Landing
* **Qué quitar hoy mismo:** *"TariffOS ya está disponible"* combinado con *"Únete a la lista de espera"*.
* **Qué poner en su lugar:** Posicionar la entrada como **Onboarding Guiado / Despliegue por Lotes para Empresas y Agencias**.
  * **Badge superior sugerido:** `Lanzamiento Comercial · Cupos abiertos para onboarding asistido`
  * **CTA Principal:** `Agendar prueba con tus propios documentos` o `Solicitar acceso corporativo`
  * **Lógica comercial:** En CustomsTech B2B, los primeros clientes entran mucho mejor mediante una sesión de 20 minutos donde suben 2 o 3 fichas técnicas reales de su operación y ven a TariffOS clasificar en vivo. Eso valida el producto y cierra contratos desde el primer día.

### 1.2. Checklist Rápido de Correcciones Obligatorias en el Landing
- [ ] **Actualizar el cinturón legal:** Cambiar `Decreto 4.907` por `Arancel NCM 10 Dígitos · Decreto 4.944 y sus 11 Reformas Vigentes (hasta Res. 007-2026)`.
- [ ] **Acotar el alcance legal del agente IA:** Cambiar *"Delega la gestión aduanera / gestión integral de trámites"* por *"Automatiza la clasificación merceológica, la validación de Regímenes Legales y el expediente de auditoría previo a SIDUNEA"*.
- [ ] **Depurar terminología foránea:** Sustituir *"fracciones arancelarias"* por *"códigos / subpartidas arancelarias"*; cambiar *"sin demoras fronterizas"* por *"sin retenciones en reconocimiento ni demoras portuarias"*.
- [ ] **Corregir escala numérica:** Cambiar *"millones de códigos arancelarios activos"* y *"resoluciones globales"* por *"los más de $10.000$ códigos NCM nacionales, Notas Legales, RGI y Notas Explicativas OMA"*.
- [ ] **Unificar voz gramatical:** Elegir *tú* o *usted* en toda la página (actualmente mezcla ambos por traducción de plantilla).
- [ ] **Activar o retirar enlaces muertos:** Quitar los 4 botones *"Saber más"* si aún no abren modales o vistas reales, y asegurar que *"Política de Privacidad"* abra un documento legal real.

---

## Parte 2: Matriz de Paridad "Lo que dice el Landing vs. Lo que debe hacer la App"

Usa esta tabla con tu equipo de desarrollo para contrastar palabra por palabra lo que hoy afirma `tariffos.app` frente al comportamiento real del sistema en backend e interfaz. **Regla de oro:** Si la app aún no hace algo al $100\%$, se ajusta el texto del landing hoy y se pasa la función al roadmap; nunca salgas a clientes con una brecha entre promesa y producto.

| Promesa actual en `tariffos.app` | Riesgo si la App no lo cumple literalmente | Qué debes verificar hoy dentro de tu App | Decisión recomendada (Landing / App) |
| :--- | :--- | :--- | :--- |
| **"Audit Trail Inmutable" / "Historial a prueba de balas para la aduana"** | Si el usuario puede editar o borrar libremente resultados pasados, o no queda guardado con qué reforma del arancel se clasificó en esa fecha, un auditor puede desestimar el registro. | 1. ¿Cada dictamen guarda fecha/hora exacta, usuario, archivo PDF original con hash (`SHA-256`) y versión exacta del Decreto/Reforma usada?<br>2. ¿Los cambios posteriores crean una *nueva versión* en vez de sobrescribir el registro anterior? | **En la App:** Implementar logs *append-only* y versionado documental.<br>**En el Landing:** Llamarlo *"Trazabilidad Documental Versionada"* si aún no tiene sellado criptográfico inmutable. |
| **"Analizan PDFs de múltiples páginas... Sin digitación manual"** | Muchos PDFs reales vienen escaneados como imagen (facturas selladas, catálogos viejos o MSDS fotografiadas) o tienen tablas complejas de composición química. | 1. ¿Tu pipeline tiene OCR robusto para PDFs escaneados (no nativos)?<br>2. ¿Extrae bien tablas multipágina sin truncar contexto?<br>3. ¿Qué pasa si el PDF solo dice *"Repuesto Modelo Z"* sin explicar qué es? | **En la App:** Si faltan datos merceológicos en el PDF, la IA **no debe adivinar**; debe pedir al usuario el dato faltante (ej. material o función).<br>**En el Landing:** Cambiar *"Sin digitación manual"* por *"Extracción automática de PDFs con detección de vacíos técnicos"*. |
| **"Clasificación con sustento legal" / "Criterios Oficiales SENIAT"** | Si el LLM solo devuelve el código `8471.30.12.00` con una explicación conversacional genérica, **no sirve como defensa aduanera** ante un reconocimiento del SENIAT. | Verificar que el output cite obligatoriamente:<br>1. Reglas Generales de Interpretación aplicadas (ej. RGI 1 y RGI 6, o RGI 3b en surtidos).<br>2. Texto exacto de la Partida ($4$ dígitos) y Subpartida ($10$ dígitos).<br>3. Notas de Sección o Capítulo verificadas (incluyendo notas excluyentes). | **En la App:** Forzar en el *schema* de salida de la IA la cita textual de RGI + Notas Legales.<br>**En el Landing:** Citar *"Criterios Oficiales SENIAT"* solo si tienes una base indexada real de Oficios de Consulta de Clasificación emitidos por la Intendencia Nacional de Aduanas. |
| **"Verificación en tiempo real"** | El cliente puede pensar que se conecta en vivo a SIDUNEA World o a portales ministeriales para validar permisos de un RIF específico. | Verificar tiempos de respuesta (si un agente autónomo tarda $45$ a $90$ segundos leyendo un manual de $30$ páginas, no es "instantáneo" de $1$ segundo, requiere barra de progreso clara por etapas). | **En la App:** Mostrar estados transparentes (*Leyendo PDF -> Analizando Notas de Capítulo -> Verificando Regímenes Legales*).<br>**En el Landing:** Hablar de *"Validación normativa en minutos"* en vez de prometer conexión directa en tiempo real con aduana. |
| **"Evitar multas, retrasos y fuga fiscal de impuestos"** | En Venezuela en 2026, clasificar bien el código pero omitir un Régimen Legal nuevo o el requisito COMEX de una exoneración detiene la carga igual que clasificar mal. | ¿Al arrojar el código de $10$ dígitos, la App muestra:<br>- Alícuota *Ad-Valorem* actualizada?<br>- Regímenes Legales (RL $1$ al $21$) de importación?<br>- Si está en lista de Exoneración (Dec. 5.197) y si exige Permiso COMEX (RL 9)?<br>- Si es BK o BIT (Columna 3 Art. 37)?<br>- Unidad Física exigida? | **Crítico en la App:** Un clasificador venezolano necesita la "foto arancelaria completa" de la fila del Artículo 37 + Exoneraciones, no únicamente los $10$ dígitos numéricos. |
| **"Garantizamos 100% de confidencialidad"** | Los clientes corporativos subirán facturas con precios FOB/CIF reales, nombres de proveedores extranjeros y fórmulas industriales. | 1. ¿Usas APIs empresariales (OpenAI Enterprise/API con *Zero Data Retention*, Anthropic API comercial, Vertex AI o AWS Bedrock) donde el entrenamiento con datos del cliente está desactivado?<br>2. ¿Están aislados los documentos por organización (*tenant_id*) en base de datos y storage (S3/GCS)? | **En la App:** Auditar políticas de retención de tus proveedores de LLM y permisos de *buckets* privados con URLs firmadas temporales.<br>**En el Landing:** Publicar una página dedicada de Seguridad y Privacidad de Datos. |

---

## Parte 3: Auditoría Técnica de la Base de Datos Regulatoria (Alerta Crítica de Fin de Año 2026)

Dado que estamos a **finales de noviembre de 2026**, tu aplicación enfrenta una prueba de fuego inmediata dentro de pocas semanas. Revisa con tu equipo de datos estos cinco puntos antes de dar de alta al primer cliente:

### 3.1. Alerta de Vencimiento del 31 de Diciembre de 2026
* **El hecho legal:** El **Decreto N° 5.197** (Gaceta Oficial Extraordinaria N° 6.952), que regula las exoneraciones vigentes (incluyendo el $90\%$ de Impuesto de Importación e IVA para los $1.351$ códigos del Apéndice I sujetos a Certificado COMEX / RL 9), **vence el 31 de diciembre de 2026**. Tradicionalmente, entre el 28 y el 31 de diciembre el Ejecutivo publica en Gaceta Oficial un nuevo decreto o prórroga con cambios de apéndices y plazos de dispensa.
* **Qué debes verificar en tu App:**
  * ¿Tu base de datos permite **actualizar decretos de exoneración y reformas parciales en horas** sin tener que reescribir código ni romper expedientes pasados?
  * ¿Muestra la App una alerta preventiva al importador indicando: *"Beneficio vigente hasta el 31/12/2026 según fecha de registro de la DUA"*? (Recuerda que según la LOA, el régimen aplicable es el vigente a la fecha de registro de la declaración de aduanas, no a la fecha de compra).

### 3.2. Integridad de las 11 Reformas del Decreto 4.944
Muchos equipos cargan el PDF o CSV original del **Decreto N° 4.944 (abril 2024)** y olvidan aplicar secuencialmente las reformas parciales posteriores. Verifica que tu base de datos tenga consolidadas las modificaciones hasta **agosto-noviembre de 2026**, incluyendo:
* **1ra Reforma (Decreto N° 5.103, marzo 2025):** Eliminación de exoneración automática de IVA para BK/BIT, cambios en sector farmacéutico, notas complementarias de automotriz, jabones y desinfectantes.
* **9na Reforma (Decreto N° 5.198, diciembre 2025):** Modificación de tarifas en **$735$ códigos** y ajustes de Regímenes Legales en **$636$ códigos**, además de desdoblamientos específicos (ej. abonos con microelementos en `3824.99.79.91` y `3824.99.79.99`, o azúcar `1701` subiendo al $98\%$).
* **10ma y 11va Reforma (hasta Resolución N° 007-2026 de agosto 2026):** Últimos ajustes de alícuotas, desdoblamientos y regímenes legales vigentes.
* **Normas Conexas:** Cruce de **Normas COVENIN de Obligatorio Cumplimiento** y restricciones especiales (ej. prohibiciones vigentes sobre RPA/drones, precursores o antigüedad vehicular).

---

## Parte 4: Protocolo de Pruebas "Rompe-IA" (10 Tests antes de salir con Clientes)

Antes de hacer una demo en vivo o entregar credenciales a tus primeros clientes, corre internamente estos **10 escenarios reales** en tu aplicación. Si la App supera al menos 9 de 10, estás listo para producción comercial con altísima confianza:

1. **Test de Reforma Reciente (Control de Obsolescencia):**
   * *Prueba:* Clasificar azúcar de caña refinada o un fertilizante con microelementos desdoblado en 2025/2026 (`3824.99.79.91`).
   * *Criterio de éxito:* Debe arrojar el código desdoblado vigente y la tarifa reformada actual (no la tarifa original de abril de 2024).

2. **Test de Nombre Comercial Engañoso vs. Naturaleza Merceológica:**
   * *Prueba:* Subir una ficha de un producto llamado comercialmente *"Pintura Impermeabilizante Acrílica"*, cuya hoja técnica (MSDS) indica que es una dispersión de polímeros acrílicos en medio acuoso o masilla plástica (Capítulo 32 vs. Capítulo 39).
   * *Criterio de éxito:* Clasificar por composición química real y texto de partida, nunca por el eslogan comercial del envase.

3. **Test de Documento Insuficiente (Anti-Alucinación):**
   * *Prueba:* Subir una factura comercial real que solo diga: *"10 pcs - Industrial Control Valve Mod. VX-90 - USD 4,500"*, sin indicar material del cuerpo, accionamiento ni si lleva actuador eléctrico/neumático o válvula reductora de presión (`8481.10` vs `8481.80`).
   * *Criterio de éxito:* La IA **no debe fingir $99\%$ de certeza** en un único código de $10$ dígitos. Debe estrechar a la partida `84.81`, mostrar las subpartidas candidatas y **listar qué preguntas técnicas hacerle al proveedor** para cerrar la clasificación.

4. **Test de Notas Legales Excluyentes (Trampa Clásica de LLMs):**
   * *Prueba:* Subir una parte o pieza de uso general (ej. tornillos de acero inoxidable o juntas/empacaduras de caucho vulcanizado sin endurecer diseñadas para una bomba centrífuga específica).
   * *Criterio de éxito:* Un mal modelo lo mete en "Partes de bombas" (`8413.91`). Un motor aduanero riguroso aplica la **Nota 2 de la Sección XVI** y la **Nota 1 g) de la Sección XVI** (partes y accesorios de uso general van a su propio régimen, Cap. 73 o `4016.93`), excluyéndolo de la partida de la máquina.

5. **Test de Juegos o Surtidos (Aplicación de RGI 3b / 3c):**
   * *Prueba:* Subir un kit acondicionado para la venta al por menor (ej. un set de mantenimiento industrial que trae una herramienta manual, un lubricante y paños textiles en un estuche).
   * *Criterio de éxito:* Identificar que es un surtido, evaluar cuál componente le confiere el **carácter esencial** bajo RGI 3b (o aplicar RGI 3c si ninguno domina) y advertir sobre las implicaciones de Regímenes Legales de los componentes secundarios.

6. **Test de Alerta de Régimen Legal y Exoneración Condicionada:**
   * *Prueba:* Clasificar un producto incluido en el Apéndice I del Decreto N° 5.197.
   * *Criterio de éxito:* Indicar la alícuota ordinaria del Arancel, señalar que goza de exoneración bajo Decreto 5.197 **pero alertar obligatoriamente que requiere tramitar el Permiso COMEX (Régimen Legal 9)** además de cualquier otro RL sanitario o técnico del código.

7. **Test de PDF Escaneado / Multilingüe:**
   * *Prueba:* Subir un catálogo técnico de maquinaria en inglés o mandarín/inglés con páginas escaneadas e imágenes con tablas de potencia ($\text{kW}$, $\text{V}$, $\text{Hz}$).
   * *Criterio de éxito:* Extraer correctamente las magnitudes físicas que definen el salto de subpartida (por ejemplo, motores eléctricos según potencia $\le 37,5\text{ W}$, $> 750\text{ W}$, $\le 75\text{ kW}$, etc. en la partida `85.01`).

8. **Test de Consistencia / Determinismo:**
   * *Prueba:* Subir exactamente la misma ficha técnica tres veces seguidas en sesiones distintas.
   * *Criterio de éxito:* Las tres corridas deben arrojar exactamente el mismo código de $10$ dígitos y el mismo fundamento normativo (temperatura del modelo controlada / *structured outputs* deterministas). Si da códigos distintos en cada intento, destruirá la promesa del landing contra *"80% inconsistencia humana"*.

9. **Test de Unidad Física y Declaración SIDUNEA:**
   * *Prueba:* Verificar que el reporte final muestre la **Unidad Física** oficial exigida por el arancel para esa subpartida (`u` unidades, `kg` kilogramos, `2u` pares, `l` litros, `m2`, etc.).
   * *Criterio de éxito:* Coincidencia exacta con la columna de Unidad Física del Artículo 37 vigente, evitando rechazos o discrepancias al cargar en SIDUNEA.

10. **Test de Exportación del Expediente de Auditoría:**
    * *Prueba:* Descargar o compartir el reporte final generado por la App y mostrárselo a un clasificador aduanero externo sin explicarle nada.
    * *Criterio de éxito:* El documento por sí solo debe leerse como un **Dictamen Merceológico Profesional** (Descripción comercial vs. descripción arancelaria sugerida, código NCM, gravámenes, RL, RGI aplicadas, notas consideradas, fecha/versión de Gaceta consultada y hash/ID del documento fuente).

---

## Parte 5: Plan de Trabajo Conjunto (Próximos 7 Días antes de Abrir a Clientes)

1. **Día 1 y 2 — Congelar la Promesa Pública (Frontend / Landing):**
   * Actualizar el copy de `tariffos.app` usando el marco del **Decreto 4.944 + Reformas vigentes**, cambiar el flujo de *"Lista de espera"* a *"Onboarding Guiado / Solicitar Demo con Documentos Reales"* y retirar promesas fuera de alcance (*"gestión integral de trámites"*, *"millones de códigos"*).
2. **Día 3 y 4 — Auditoría de Base de Datos y Motor IA (Backend):**
   * Validar que estén cargadas hasta la **11va Reforma (Res. 007-2026)** y el **Decreto 5.197**, y preparar el *script* de ingesta rápida para el nuevo Decreto de Exoneraciones que saldrá a fin de diciembre de 2026.
   * Revisar *prompts* y *schemas* para garantizar que la IA pida información adicional cuando el PDF sea ambiguo en lugar de inventar atributos.
3. **Día 5 y 6 — Corrida del "Golden Dataset" (Los 10 Tests Rompe-IA):**
   * Ejecutar los 10 casos de prueba anteriores con el apoyo de un especialista merceológico venezolano y documentar aciertos y bordes.
4. **Día 7 — Kit de Onboarding para Primeros Clientes:**
   * Usar uno de los dictámenes reales impecables generados en el Día 5 como **ejemplo interactivo o descargable dentro del propio Landing**, cerrando el círculo: el visitante lee lo que promete TariffOS, ve un expediente real generado por la App y agenda su incorporación inmediata.