# CHECHU · inicio y sincronización

Después de ingresar con la misma cuenta, el dashboard se abre y descarga automáticamente la copia existente. Los cambios guardados se comprueban cada cinco segundos con la página visible y al volver a la app o recuperar conexión. No hay controles manuales de nube en el uso habitual.

En Settings → Copia de seguridad se descarga un JSON completo con los diez registros: dashboard, imágenes, finanzas Armenia, tours, finanzas JOY, precios, categorías, presupuestos, catálogo y notas. Recuperar datos anteriores contiene los originales y las copias de recuperación. Los originales del navegador no se modifican durante la sincronización de la cuenta.

La primera migración sigue siendo explícita y solo crea un registro si la nube no tiene datos; nunca se sube automáticamente un móvil vacío. Con una nube existente, un dispositivo nuevo conserva una copia local de recuperación antes de recibirla.

Se usa la última versión sincronizada como referencia común para combinar cambios independientes por campo y por registros con ID. Las diferencias de formato JSON no cuentan como cambios. Editar y eliminar el mismo registro o cambiar el mismo valor de dos maneras requiere una elección sencilla en Settings. Se muestran ambos valores y se conserva el resto de los cambios combinados. Una copia de ambas versiones se guarda antes de actualizar; las escrituras comprueban atómicamente la versión en Supabase. No se elige por defecto un importe financiero en conflicto.

Los formularios abiertos retrasan las actualizaciones recibidas. Se comprobó también que una edición durante una petición no revierta información del otro dispositivo. Las pruebas con cliente simulado cubren inicio automático, descarga inicial, combinación de campos y altas distintas, conflictos reales, eliminación frente a edición, recuperación ante fallo, móvil vacío y migración explícita. No se han inspeccionado datos privados ni modificado las políticas SQL en este cambio.

