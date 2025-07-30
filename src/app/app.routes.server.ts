import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Server, // Cambia a Server para evitar errores de prerendering
  },
  {
    path: 'add',
    renderMode: RenderMode.Server, // Cambia a Server para evitar errores de prerendering
  },
  {
    path: 'edit/:id',
    renderMode: RenderMode.Server, // Mantiene Server como en la solución previa
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];