import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/aviancss',
      name: 'aviancss',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AvianCss.vue'),
      children: [
        {
          path: '',
          name: 'avian-index',
          component: () => import('../components/avian/index.vue'),
        },
        {
          path: '/typography',
          name: 'avian-typography',
          component: () => import('../components/avian/typography.vue'),
        },
        {
          path: '/buttons',
          name: 'avian-buttons',
          component: () => import('../components/avian/buttons.vue'),
        },
        {
          path: '/links',
          name: 'avian-links',
          component: () => import('../components/avian/links.vue'),
        },
        {
          path: '/inputs',
          name: 'avian-inputs',
          component: () => import('../components/avian/inputs.vue'),
        },
        {
          path: '/table',
          name: 'avian-table',
          component: () => import('../components/avian/table.vue'),
        },
        {
          path: '/colors',
          name: 'avian-colors',
          component: () => import('../components/avian/utilities/colors.vue'),
        },
      ]
    }
  ]
});

export default router;
