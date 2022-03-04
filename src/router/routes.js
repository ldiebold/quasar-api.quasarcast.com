
const routes = [
  {
    path: '/build',
    component: () => import('layouts/BlankLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/BuildApiCardPage.vue')
      }
    ]
  },
  {
    path: '/',
    component: () => import('pages/IndexPage.vue')
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorPage404.vue')
  }
]

export default routes
