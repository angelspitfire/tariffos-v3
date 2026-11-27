---
description: Use when classifying merchandise into Venezuela's 10-digit NCM customs tariff (Decreto 4.944, GOE 6.804) following strict RGI 1→6 rules, official verification, HITL clarification, and A2UI Verdict + Dossier output.
---

# Clasificación Arancelaria Venezuela — NCM 10 dígitos (Decreto 4.944)

Sigue este procedimiento cada vez que clasifiques una mercancía individual para importación en Venezuela (SA 6 dígitos + NCM 2 dígitos + Nacional 2 dígitos = `xxxx.xx.xx.xx`).

## 1. Validación previa de datos técnicos (antes de clasificar)
1. Evalúa si la descripción incluye los atributos determinantes de la subpartida (función principal, composición/material, potencia o voltaje, peso/dimensiones, estado/presentación, uso final o número CAS).
2. Si el usuario da una marca/modelo comercial concreto sin ficha técnica (ej. *"MacBook Pro 14 M3"*, *"Apple Watch Series 9"*) y `webEnrichmentEnabled !== false`, consulta `web_search` primero para completar los datos verificables sin molestar al usuario.
3. Si faltan datos técnicos críticos que cambian la subpartida y no pueden inferirse de forma confiable (ej. motor eléctrico sin potencia kW ni fases, tejido sin composición porcentual, químico sin CAS, producto ambiguo con 2+ capítulos posibles), invoca **`request_technical_clarification`**:
   - Usa `mode: "questionnaire"` con opciones clicables (`fieldType: "select"`, hasta 5 opciones) cuando falten atributos específicos.
   - Usa `mode: "disambiguation"` cuando el producto pueda ser 2 o 3 cosas físicamente distintas.
   - Formula solo las preguntas estrictamente determinantes (máximo 3 campos).

## 2. Recorrido estricto RGI 1 → 6
- Trata cualquier partida sugerida por el usuario como **hipótesis**.
- Recorre en orden sin saltar pasos:
  1. **RGI 1:** textos de partida y notas de Sección/Capítulo.
  2. **RGI 2a / 2b:** artículos incompletos/desmontados o mezclas.
  3. **RGI 3a / 3b / 3c:** solo si RGI 1 y 2 no resuelven (carácter esencial en 3b).
  4. **RGI 4 y 5a/5b:** analogía y estuches/envases.
  5. **RGI 6:** determinación de subpartida hasta nivel nacional de **10 dígitos** (`xxxx.xx.xx.xx`).
- Nunca inventes notas legales ni tasas; verifica siempre contra `NationalTariff`.

## 3. Reglas de referencia frecuentes (Decreto 4.944)
- **Smartwatches / Wearables (Cap. 91):** `9102.12` aplica solo a indicadores optoelectrónicos *solamente*; smartwatches multifunción (GPS, apps, sensores, notificaciones) clasifican en `9102.19.00.00` (salvo caja de metal precioso en `91.01`).
- **Portátiles / Laptops (Cap. 84, Nota 5B):** máquinas automáticas de procesamiento de datos portátiles ≤ 10 kg con CPU + teclado + pantalla clasifican en `8471.30` (excluyendo teléfonos de Cap. 85). Verifica peso y tamaño de pantalla para distinguir `.11`, `.12`, `.19` y `.90`.

## 4. Ejecución y salida A2UI
1. Ejecuta **`classify_item`** con la descripción técnica completa, país de origen, Incoterm y valor CIF si el usuario lo proporcionó (`deepMode: true` si `clientContext.deepMode` está activo).
2. Confirma que el resultado incluya partida verificada a 10 dígitos, nivel de confianza (`Alto >= 85%`, `Medio 60–84%`, `Bajo < 60%`), alternativas descartadas y permisos OGA.
3. Si la confianza es `< 85%`, faltan pruebas documentales o existen permisos OGA / restricciones críticas, carga la skill `oga-compliance-review` y evalúa llamar a `request_dossier_review`.
4. En tu respuesta de texto, resume de forma concisa la partida recomendada, la ruta RGI aplicada, la confianza y los puntos clave (el `VerdictCard` y el `Dossier` del Canvas muestran el detalle estructurado; evita repetir tablas redundantes).
