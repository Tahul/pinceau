export default defineAppConfig({
  docus: {
    title: 'Pinceau',
    description: 'Make your <script> lighter and your <style> smarter.',
    image: 'https://pinceau.dev/social.jpg',
    socials: {
      twitter: 'yaeeelglx',
      github: 'Tahul/pinceau',
      facebook: '',
      instagram: '',
      youtube: '',
      medium: '',
    },
    aside: {
      level: 0,
      collapsed: false,
      exclude: [],
    },
    main: {
      padded: true,
      fluid: true,
    },
    header: {
      title: '',
      logo: true,
      showLinkIcon: true,
      exclude: [],
      fluid: true,
    },
    footer: {
      credits: {
        icon: 'MovingHead',
        text: 'Built with Nuxt Studio',
        href: 'https://docus.com',
      },
      iconLinks: [
        {
          href: 'https://nuxt.com',
          icon: 'IconNuxtLabs',
          label: 'Nuxt',
        },
      ],
      fluid: true,
    },
    github: {
      dir: 'docs/content',
      branch: 'main',
      repo: 'pinceau',
      owner: 'Tahul',
      edit: true,
    },
  },
})
