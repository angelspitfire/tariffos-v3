---
description: Use when the user pastes or attaches a multi-item commercial invoice, packing list, or manifest (2 to 25 items) to classify in chat with live streaming triage.
---

# Análisis de Manifiestos y Facturas en Chat (2 a 25 líneas)

Usa este procedimiento cuando el usuario pegue una lista de mercancías, tabla de factura comercial, packing list o adjunte un documento con múltiples ítems dentro del hilo.

## 1. Conteo y ruteo por volumen
- **1 solo ítem:** no uses esta skill; carga `ve-rgi-classification` y ejecuta `classify_item`.
- **2 a 25 ítems:** extrae cada línea con sus campos limpios (`sku`, `description`, `originCountry`, `cifValue`) y llama directamente a **`analyze_invoice_manifest`**. Esto transmite progreso en vivo y abre el tab **Lote** del Canvas sin obligar al usuario a subir un archivo aparte ni esperar polling.
- **Más de 25 ítems:** informa al usuario que el manifiesto supera el límite interactivo en chat (25 líneas) y guíalo a usar el botón **Lote masivo Excel / PDF** (en el compositor `+` o pantalla inicial) para procesarlo de forma asíncrona en segundo plano.

## 2. Normalización de líneas antes de llamar a `analyze_invoice_manifest`
- Conserva códigos SKU/parte y descripciones técnicas completas (material, potencia, capacidad, uso) por línea.
- Si el origen no aparece por línea, usa el país de procedencia de la cabecera o `'CN'` como respaldo, indicándolo al usuario.
- Si los montos vienen en valor unitario × cantidad, calcula el subtotal por línea para `cifValue` (o `0` si el documento no declara montos).
- Asigna un `documentReference` legible (ej. número de factura, B/L o nombre del archivo adjunto).

## 3. Presentación del resultado
- Resume cuántas líneas se procesaron, cuántas quedaron **clasificadas automáticamente** y cuántas quedaron en **`needs_review`** (triage pendiente).
- Invita al usuario a abrir la pestaña **Lote** del Canvas y usar **Iniciar Triage rápido** para resolver las líneas pendientes con avance automático.
