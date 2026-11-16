# CHECHU DASHBOARD: activación pendiente

URL verificada: https://tualpjxsvnjrpesgfueq.supabase.co
Email habilitado, registro permitido y confirmación por correo requerida. La comprobación pública no demuestra que exista una cuenta de la usuaria ni una sesión iniciada. No se han leído ni migrado datos personales.

## Antes de publicar

1. Ejecutar `supabase-sync.sql` en el editor SQL del proyecto. Añade políticas de propietario y una función de escritura con comprobación atómica de versión. No borra registros.
2. Probar con dos cuentas de prueba que cada una solo puede leer y escribir su propio registro, y que dos escrituras con la misma versión permiten solo una actualización.
3. Publicar la rama después de revisar el cambio y probar email/contraseña en la URL final.

## Primera migración: computadora principal

1. Abrir el navegador y la dirección donde están los datos originales. No borrar almacenamiento ni reinstalar la PWA.
2. Descargar “respaldo completo original”. Incluye los diez registros de tareas, imágenes, finanzas Armenia y JOY, precios, categorías, tours, presupuestos, catálogo y notas.
3. Crear cuenta, confirmar correo e ingresar. La cuenta usa una copia de trabajo separada; conserva los originales.
4. Elegir “Migrar datos originales de esta computadora”, guardar el respaldo y confirmar. Solo crea la nube si no existe registro. Una nube vacía del móvil nunca se sube automáticamente.
5. Revisar cantidades de tareas, objetivos, movimientos y presupuestos contra los originales. Comparar también importes y cotizaciones. No declarar completa la migración antes de esta revisión.
6. En el teléfono ingresar con la misma cuenta y elegir “Descargar nube”. Se respalda su copia anterior antes de reemplazarla.

La sincronización de cambios guardados funciona cada cinco segundos mientras la página está visible. Un conflicto detiene las subidas. Respaldar ambos dispositivos antes de resolverlo descargando la versión elegida. Los formularios de presupuesto requieren Guardar. El respaldo incluye valores financieros y tasas almacenadas sin recalcularlos durante la migración.

La PWA ofrece actualización explícita. Guardar formularios antes de aceptarla. La autenticación necesita conexión y usa Supabase JS desde esm.sh; el modo original local sigue disponible si no hay conexión. No se cachean respuestas de Supabase en el service worker.

## Revisión financiera

Se corrigió el descuento duplicado del chofer en personalizados de cinco o más pasajeros. Caso comprobado: transporte 35.000 AMD + 15% de extras de transporte + guía 10.000 AMD + propina guía 1.000 AMD = costo 51.250 AMD; honorarios 15% y cobertura 3% dan precio 60.475 AMD.

Se conserva por separado la referencia USD/AMD al buscar cotización para presupuestos en EUR. Si falta esa referencia, la ganancia en USD queda pendiente y no usa incorrectamente EUR/AMD como USD/AMD. Los presupuestos EUR antiguos necesitan actualizar su cotización.

## Validación realizada y límites

Comprobación de sintaxis de los seis scripts inline, sincronización y service worker; aislamiento de cuenta sin modificar los originales; cálculo de presupuesto y expresiones aritméticas. Conexión real al endpoint público de configuración de autenticación comprobada. Faltan pruebas visuales, acceso real con cuenta, ejecución del SQL, pruebas RLS y concurrencia en Supabase y verificación con los datos originales. Esta rama no debe considerarse una migración completada.

