import { RouterProvider } from 'react-router-dom'

import { router } from '@/routes'

/** Root component: mounts the router. */
export function App() {
  return <RouterProvider router={router} />
}
