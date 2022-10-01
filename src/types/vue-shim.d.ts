declare module "*.vue" {
  import Vue from 'vue';
  declare const $variantsClass: string
  interface ComponentCustomProperties {
    $variantsClass: any;
  }
  export default Vue;
}

declare global {
  const $variantsClass: string

  interface ComponentCustomProperties {
    $variantsClass: any;
  }
}

export {}
