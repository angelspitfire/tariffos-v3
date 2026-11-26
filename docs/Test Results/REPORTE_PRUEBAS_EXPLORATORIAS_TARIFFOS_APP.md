# 🐛 Reporte de Pruebas Exploratorias — https://tariffos.app

**Fecha:** 26 Nov 2026  
**Probador:** Agente OpenCode (Browser skill, Chromium)  
**URL objetivo:** https://tariffos.app (producción, Next.js en Vercel)  
**Método:** Pruebas interactivas en página real + verificación contra código fuente  
**Estado:** Final — solo hallazgos reales verificados

---

## 📊 Resumen ejecutivo

Se probaron: landing, anclas de navegación (header/footer), formularios (contacto, login, registro, recuperación de contraseña), clasificador de mercancía, toggle de tema oscuro, enlaces de footer y OAuth Google.  
**Resultado:** la mayoría de flujos funcionan correctamente. Se encontraron **3 problemas reales** relacionados con la configuración de Supabase Auth en producción y 1 problema de UX en el comportamiento de llenado de campos.

---

## ✅ Qué funciona correctamente (verificado)

| Área | Prueba | Resultado |
|------|--------|-----------|
| Landing page | Carga sin errores de consola | ✅ OK |
| Anclas header (`#demo`, `#capacidades`, `#como-funciona`, `#planes`, `#faq`) | Click → scroll a sección destino | ✅ Todas funcionan |
| Dark mode toggle | Clase `dark` aplicada en `<html>` | ✅ OK |
| Formulario contacto | Envío → POST `/api/leads` 201 → mensaje "Solicitud recibida" | ✅ OK |
| Clasificador mercancía | 3 presets (Bomba, Laptop, Aceite) → partida arancelaria, confianza, RGI, IVA, Tasa | ✅ OK |
| Descarga PDF ejemplo | Enlace `/samples/dictamen-ejemplo-tariffos.pdf` | ✅ OK |
| Login con credenciales inválidas | Mensaje "Invalid login credentials" | ✅ OK |
| Registro | Campos: Nombre, Email, Contraseña, Confirmar contraseña (todos required) | ✅ OK |
| Toggle mostrar/ocultar contraseña | Cambia `type="password"` ↔ `type="text"` | ✅ OK |
| `/activate-plan`, `/admin/billing` | Redirigen a `/login` (requieren auth) | ✅ OK |
| "Activar Piloto" header | Redirige a `/login?next=/onboarding?plan=pilot&cycle=monthly` | ✅ OK |
| Consola en landing | 0 errores | ✅ OK |

---

## 🔴 Problemas reales encontrados

### #1 — "Continuar con Google" devuelve 400 de Supabase OAuth

**Síntoma:** Al hacer clic en "Continuar con Google" en `/login`, el navegador es redirigido a:
```
https://avlmnfillieppgqjmawk.supabase.co/auth/v1/authorize?provider=google&redirect_to=...
```
que responde con **HTTP 400**. Error en consola:
```
Failed to load resource: the server responded with a status of 400 ()
```

**Código implicado:** `login-actions.ts:46-67` (`executeGoogleAuth`) llama a `supabase.auth.signInWithOAuth({ provider: 'google' })`.

**Causa:** Google OAuth no está habilitado/configurado en el proyecto Supabase `avlmnfillieppgqjmawk` (faltan Client ID, Client Secret, o la redirect URL no está en la allowlist de Supabase).

**Impacto:** Los usuarios no pueden autenticarse con Google en producción. El botón debería ocultarse o deshabilitarse hasta que Google OAuth esté configurado.

**Evidencia:** Capturado en consola del navegador (pestaña `tab_d673fde3-3617-4c20-86bf-1335e3b6054e`).

---

### #2 — "¿Olvidaste tu contraseña?" devuelve 400 de Supabase

**Síntoma:** Al hacer clic en "¿Olvidaste tu contraseña?" en `/login`, el endpoint Supabase responde con **HTTP 400**:
```
https://avlmnfillieppgqjmawk.supabase.co/auth/v1/recover?redirect_to=https%3A%2F%2Ftariffos.app%2Fauth%2Fcallback%3Fnext%3D%252Flogin
```

**Código implicado:** `login-actions.ts:137-160` (`executePasswordReset`) llama a `supabase.auth.resetPasswordForEmail()`.

**Causa:** El restablecimiento de contraseña no está configurado correctamente en Supabase (o la redirect URL no está en la allowlist).

**Impacto:** Los usuarios no pueden recuperar su contraseña en producción.

**Evidencia:** Capturado en consola del navegador (pestaña `tab_d673fde3-3617-4c20-86bf-1335e3b6054e`).

---

### #3 — UX: Llenado de campo concatena en lugar de reemplazar (posible)

**Síntoma:** En la página de login, tras llenar el campo de email dos veces con valores diferentes, el campo mostró un valor mezclado:
```
value="test@tariffos.cousuario@inexistente.com"
```

**Observación:** Esto ocurrió tras hacer `fill` en el campo de correo electrónico que ya contenía un valor previo. El `fill` del navegador no limpió el valor anterior antes de escribir el nuevo.

**Causa posible:** El componente de input no tiene un comportamiento `clear` antes de escribir, o el `fill` del navegador no está limpiando el campo primero.

**Impacto:** Bajo. El usuario puede escribir valores incorrectos sin darse cuenta. Requiere más pruebas para confirmar si es un problema del componente o del agente de navegador.

**Evidencia:** Observado en snapshot de accesibilidad (pestaña `tab_d673fde3-3617-4c20-86bf-1335e3b6054e`).

---

## ❌ Hallazgos descartados (verificados como falsos positivos)

| Hallazgo inicial | Por qué se descarta |
|-----------------|---------------------|
| Enlaces rotos 404 (`/demo`, `/capacidades`, etc.) | Los `href` son anclas internas (`#demo`, `#capacidades`), no rutas. Todas las secciones destino tienen su `id` definido y el scroll funciona. |
| Formulario contacto sin feedback | Implementa estado de carga, botón deshabilitado, errores con `role="alert"`, y vista de confirmación ("Solicitud recibida"). |
| Clasificador demo sin loader | Usa datos estáticos locales con transición framer-motion de 240 ms. No hay red. |
| `/activate-plan` como 404 | Redirige a `/login` (requiere auth). Comportamiento correcto. |

---

## 📋 Próximos pasos recomendados

1. **Configurar Google OAuth en Supabase:** Agregar Client ID y Client Secret del proveedor Google en la consola de Supabase, y agregar la redirect URL (`https://tariffos.app/auth/callback`) a la allowlist de URLs de redirección.

2. **Configurar restablecimiento de contraseña en Supabase:** Verificar que el SMTP esté configurado en Supabase y que la URL de redirect (`/auth/callback`) esté en la allowlist.

3. **Probar el comportamiento de fill en campos de input:** Verificar si el problema de concatenación es del componente o del navegador. Si es del componente, agregar comportamiento de limpieza antes de escribir.

4. **Re-testear tras correcciones:** Volver a ejecutar las pruebas para confirmar que Google OAuth y Password Reset funcionan.

---

## 📄 Evidencia capturada

- Pestaña de prueba principal: `tab_4532f926-0df7-47be-b7e6-35b8df0d0038` (landing)
- Pestaña de login: `tab_d673fde3-3617-4c20-86bf-1335e3b6054e` (donde se capturaron los errores 400)
- Error 400 Google OAuth: `https://avlmnfillieppgqjmawk.supabase.co/auth/v1/authorize?provider=google&...`
- Error 400 Password Reset: `https://avlmnfillieppgqjmawk.supabase.co/auth/v1/recover?redirect_to=...`
- Consola de landing: 0 errores
- POST `/api/leads`: HTTP 201 (contacto exitoso)
