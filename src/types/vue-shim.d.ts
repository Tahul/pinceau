declare module "*.vue" {
  import Vue from 'vue';
  declare const $variantsClass: string
  export default Vue;
}

declare global {
  const $variantsClass: string
}

export {}
