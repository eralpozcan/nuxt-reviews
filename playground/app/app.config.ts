export default defineAppConfig({
  ui: {
    colors: {
      primary: 'emerald',
      neutral: 'slate'
    },
    footer: {
      slots: {
        root: 'border-t border-default',
        left: 'text-sm text-muted'
      }
    }
  },
  seo: {
    siteName: 'nuxt-reviews'
  },
  header: {
    title: 'nuxt-reviews',
    to: '/',
    search: true,
    colorMode: true,
    links: [{
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/eralpozcan/nuxt-reviews',
      'target': '_blank',
      'aria-label': 'GitHub'
    }]
  },
  footer: {
    credits: `Built with Nuxt UI`,
    colorMode: false,
    links: [{
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/eralpozcan/nuxt-reviews',
      'target': '_blank',
      'aria-label': 'GitHub'
    }]
  },
  toc: {
    title: 'Table of Contents',
    bottom: {
      title: 'Community',
      edit: 'https://github.com/eralpozcan/nuxt-reviews/edit/main/playground/content',
      links: [{
        icon: 'i-lucide-star',
        label: 'Star on GitHub',
        to: 'https://github.com/eralpozcan/nuxt-reviews',
        target: '_blank'
      }]
    }
  }
})
