---
description: Use when evaluating Venezuelan OGA/PGA permits (SENCAMER, SACS, CONATEL, INSAI, MINEC, Regímenes Legales 1–19), antidumping/safeguard flags, or deciding whether to escalate a dossier to human customs broker review.
---

# Auditoría OGA/PGA y Escalamiento a Revisión Técnica (`in_review`)

Usa este procedimiento cuando un dictamen o una consulta involucre permisos previos al despacho, regímenes legales venezolanos, antidumping/salvaguardias o criterios de revisión humana.

## 1. Verificación oficial obligatoria
- Consulta **`verify_hs_code`** para confirmar el régimen legal y los permisos OGA registrados en `NationalTariff` para la subpartida de 10 dígitos.
- Nunca inventes códigos de régimen legal ni asumas permisos no respaldados por el arancel oficial o la naturaleza física verificada del producto.

## 2. Organismos OGA frecuentes en Venezuela
- **CONATEL:** homologación obligatoria para equipos con transmisión radioeléctrica (Wi-Fi, Bluetooth, celular 4G/5G, RF).
- **SENCAMER:** reglamentos técnicos, etiquetado en español, metrología, textiles, calzado, electrodomésticos y autopartes reguladas.
- **SACS (MPPS):** alimentos procesados, bebidas, medicamentos, cosméticos, dispositivos médicos e insumos sanitarios.
- **INSAI:** productos agropecuarios, semillas, fertilizantes, madera sin tratar, productos de origen animal o vegetal.
- **MINEC / DAEX / RESQUIMC:** sustancias químicas controladas, precursores, refrigerantes regulados o mercancías de seguridad/defensa.

## 3. Límites legales de opinión
- **Antidumping y salvaguardias:** nunca emitas conclusión definitiva sobre su aplicabilidad; marca una alerta clara (`flag`) para verificación en Gaceta Oficial / SENIAT.
- **Reglas de origen / TLC:** señala la existencia de acuerdos aplicables como orientación preliminar, requiriendo certificado de origen formal y análisis de cumplimiento de origen por separado.

## 4. Criterios obligatorios para invocar `request_dossier_review`
Llama a **`request_dossier_review`** con `invokedBySkill: "oga-compliance-review"`, una `reason` específica y `missingFields` (cuando falten documentos o atributos) siempre que ocurra al menos uno de estos casos:
1. Confianza del dictamen `< 85%` o disputa relevante bajo RGI 3b.
2. Evidencia merceológica incompleta (faltan datos que pueden mover la subpartida).
3. Código con **régimen prohibido, restringido o permisos OGA obligatorios** no acreditados todavía en el expediente.
4. Sospecha de medidas antidumping, salvaguardias o partida no confirmada exactamente en `NationalTariff`.
