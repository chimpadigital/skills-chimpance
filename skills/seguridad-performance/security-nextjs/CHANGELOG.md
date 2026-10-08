# Changelog — security-nextjs

Basado en el skill original `security-nextjs` (igorwarzocha).

## Mejoras aplicadas

### Nueva seccion — URL Search Params sin whitelist (mass-assignment)
- Agregado patron de vulnerabilidad HIGH: Object.fromEntries(searchParams.entries()) spread directo al body de un POST.
- Incluye ejemplo vulnerable vs. seguro con whitelist explicita.
- Incluye grep command para encontrar el patron en el codebase.
- Agregada entrada en la tabla Common Vulnerabilities.
- Origen: proyecto PROME, wrapper-solicitud.tsx recibiendo searchParams del simulador externo del banco sin validar campos.
