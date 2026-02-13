# ADR-001: Arquitectura objetivo frontend (Vue 3 + TypeScript)

- Estado: Aprobado
- Fecha: 2026-02-13
- Decisores: Equipo frontend

## Contexto

El frontend actual esta implementado con JavaScript modular y renderizado directo de DOM.
La logica de orquestacion, navegacion, estado y render esta muy concentrada en un unico controlador, lo que aumenta acoplamiento, dificulta pruebas y reduce escalabilidad.

Se definio migrar a Vue 3 + TypeScript manteniendo Bootstrap como base visual.

## Decision

Adoptar una arquitectura por capas y por modulos funcionales:

1. `presentation`: componentes Vue, paginas, router, composables UI.
2. `application`: casos de uso y coordinacion de reglas de aplicacion.
3. `domain`: entidades, value objects, contratos de repositorio y reglas de negocio.
4. `infrastructure`: clientes HTTP, mappers/adapters y repositorios concretos.

Las dependencias solo pueden ir hacia adentro:

- `presentation` -> `application` -> `domain`
- `infrastructure` implementa contratos de `domain`
- `domain` no depende de `application`, `presentation` ni `infrastructure`

## Limites por modulo (bounded contexts pragmaticos)

Se definen modulos funcionales iniciales:

- `remitos`
- `comprobantes`
- `clientes`
- `productos`
- `listas-precio`

Cada modulo contiene sus capas (`domain`, `application`, `infrastructure`, `presentation`) y expone una API publica minima.

## Reglas de estado y datos

- Estado de servidor: `TanStack Query`.
- Estado UI/transversal: `Pinia`.
- No duplicar en `Pinia` datos que ya estan cacheados en Query.
- Los DTO de API legacy se transforman en `infrastructure/mappers` antes de entrar a `domain`.

## Estructura de referencia

```text
src/
  app/
    main.ts
    router/
    providers/
  shared/
    ui/
    design/
    lib/
    types/
  modules/
    remitos/
      domain/
      application/
      infrastructure/
      presentation/
    comprobantes/
    clientes/
    productos/
    listas-precio/
```

## Consecuencias

Positivas:

- Menor acoplamiento y mayor testabilidad.
- Escalabilidad por modulo sin crecer en complejidad ciclomatica central.
- Mejor trazabilidad entre contratos de dominio y adaptadores de API.

Costos:

- Mayor disciplina de arquitectura.
- Costo inicial de setup y curva de aprendizaje TypeScript/Vue.

## Criterios de aceptacion

- Ningun archivo de `domain` importa desde `application`, `presentation` o `infrastructure`.
- Cada modulo nuevo nace con las cuatro capas.
- Las llamadas HTTP se realizan solo en `infrastructure`.
- Las vistas consumen casos de uso/composables, no clientes HTTP directos.
