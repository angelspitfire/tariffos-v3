---
description: Use when calculating or recalculating deterministic CIF customs valuation, Incoterms (EXW/FOB/CFR/CIF/DDP), ad valorem duty, IVA, customs service fee, preferential origin discounts, exemptions, antidumping, or BCV USD/VES conversions.
---

# Liquidación Aduanera y Valoración CIF (Determinista)

Sigue este procedimiento cuando el usuario pida calcular impuestos, cambiar Incoterm, ajustar flete/seguro, aplicar certificado de origen, exoneración, antidumping o actualizar la tasa BCV.

## Reglas obligatorias
1. **Nunca calcules tributos manualmente en el LLM.** Usa siempre la herramienta determinista **`calculate_duties`**.
2. **Nunca re-ejecutes `classify_item`** si el código HS y la tasa Ad Valorem ya están confirmados en el hilo. Si el usuario solo da un código HS sin tasas, ejecuta primero `verify_hs_code` para obtener el Ad Valorem e IVA oficiales.
3. **Tasa BCV:** si el usuario pregunta explícitamente la tasa oficial del día o solicita actualizarla, invoca **`get_bcv_rate`** (`refresh: true` solo si pide refrescar en vivo). Si no indicó tasa personalizada, `calculate_duties` obtendrá automáticamente la tasa oficial USD/VES vigente.

## Manejo de Incoterms
- **EXW:** suma `invoiceAmount + originChargesAmount + freightAmount + insuranceAmount` para conformar la base CIF.
- **FOB:** suma `invoiceAmount + freightAmount + insuranceAmount`.
- **CFR:** suma `invoiceAmount + insuranceAmount`.
- **CIF / DDP:** toma `invoiceAmount` como base aduanera (ajusta solo si el usuario desglosa conceptos).

## Respuesta al usuario
1. Presenta de forma limpia y tabular:
   - Base imponible CIF (USD y VES con la tasa aplicada).
   - Ad Valorem efectivo (indicando si aplica acuerdo preferencial con certificado de origen o exoneración).
   - Tasa por servicios de aduana (1% estándar SENIAT).
   - IVA (16% sobre base + gravámenes cuando aplique) y cualquier derecho antidumping.
   - **Total tributos** y **Costo total nacionalizado**.
2. Indica brevemente que la calculadora interactiva quedó actualizada en la pestaña **Tributos CIF** del Canvas para simulaciones en vivo.
