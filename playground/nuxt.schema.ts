/**
 * Taken from Docus theme to test schema feature locally.
 */

export default defineNuxtConfigSchema({
  appConfig: {
    /**
     * Docus theme configuration.
     *
     * @studio-icon material-symbols:docs
     */
    docus: {
      /**
       * Website title, used as header default title and meta title.
       *
       * @studio-icon material-symbols:title
       */
      title: 'Docus',
      /**
       * Website description, used for meta description.
       *
       * @studio-icon material-symbols:description
       */
      description: 'The best place to start your documentation.',
      /**
       * Cover image.
       *
       * @example '/cover.jpg'
       *
       * @studio-icon dashicons:cover-image
       */
      image:
        'https://user-images.githubusercontent.com/904724/185365452-87b7ca7b-6030-4813-a2db-5e65c785bf88.png',
      /**
       * Social links.
       *
       * Will be used in Social Icons component, in AppHeader and AppFooter.
       *
       * @studio-icon material-symbols:share-outline
       */
      socials: {
        /**
         * Twitter social handle
         * @example 'nuxt_js'
         * @studio-icon simple-icons:twitter
         */
        twitter: '',
        /**
         * GitHub org or repository
         * @example 'nuxt/framework'
         * @studio-icon simple-icons:github
         */
        github: '',
        /**
         * Facebook page url
         * @example https://www.facebook.com/groups/nuxtjs
         * @studio-icon simple-icons:facebook
         */
        facebook: '',
        /**
         * Instagram page url
         * @example https://www.instagram.com/wearenuxt
         * @studio-icon simple-icons:instagram
         */
        instagram: '',
        /**
         * Instagram page url
         * @example https://www.youtube.com/@NuxtLabs
         * @studio-icon simple-icons:youtube
         */
        youtube: '',
        /**
         * Medium page url
         * @example https://medium.com/nuxt
         * @studio-icon simple-icons:medium
         */
        medium: '',
      },
    },
  },
})
