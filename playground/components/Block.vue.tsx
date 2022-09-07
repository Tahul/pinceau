
export default await (async () => {
const __VLS_setup = async () => {
const props = defineProps({
  ...$variantsProps('button'),
})
const __VLS_Component = (await import('vue')).defineComponent({
props: ({
  ...$variantsProps('button'),
}),
setup() {
return {
};
},
});

const __VLS_options = {
};

let __VLS_name!: 'Block';
function __VLS_template() {
import * as __VLS_types from './__VLS_types.js'; import('./__VLS_types.js');
let __VLS_ctx!: __VLS_types.PickNotAny<__VLS_Ctx, {}> & InstanceType<__VLS_types.PickNotAny<typeof __VLS_Component, new () => {}>> & InstanceType<__VLS_types.PickNotAny<typeof __VLS_component, new () => {}>> & {
};
let __VLS_vmUnwrap!: typeof __VLS_options & { components: { } };
/* Components */
let __VLS_otherComponents!: NonNullable<typeof __VLS_component extends { components: infer C } ? C : {}> & __VLS_types.GlobalComponents & typeof __VLS_vmUnwrap.components & __VLS_types.PickComponents<typeof __VLS_ctx>;
let __VLS_selfComponent!: __VLS_types.SelfComponent<typeof __VLS_name, typeof __VLS_component & (new () => { $slots: typeof __VLS_slots })>;
let __VLS_components!: typeof __VLS_otherComponents & Omit<typeof __VLS_selfComponent, keyof typeof __VLS_otherComponents>;
__VLS_components['/* __VLS_.SearchTexts.Components */'];
({} as __VLS_types.GlobalAttrs)['/* __VLS_.SearchTexts.GlobalAttrs */'];
/* Style Scoped */
type __VLS_StyleScopedClasses = {}
 & { 'primary'?: boolean };
let __VLS_styleScopedClasses!: __VLS_StyleScopedClasses | keyof __VLS_StyleScopedClasses | (keyof __VLS_StyleScopedClasses)[];
/* CSS variable injection */
/* CSS variable injection end */
{
<button class={({ ...__VLS_ctx.$props })} ></button>;

__VLS_styleScopedClasses = ({ ...$props });
[$props,];
for (const [[key, value]] of __VLS_types.getVforSourceType(Object.entries(__VLS_ctx.$props))) {
[$props,];
if (value) {
{
<p key={(key)} ></p>;

( value ? key : '' );
}
}
}
}
if (typeof __VLS_styleScopedClasses === 'object' && !Array.isArray(__VLS_styleScopedClasses)) {
}
declare var __VLS_slots:
{
};
return __VLS_slots;
}
const __VLS_component = (await import('vue')).defineComponent({
setup() {
return {
};
},
});
return {} as typeof __VLS_Component;
};
return await __VLS_setup();
})();
import type { TokensFunction, CSS, PinceauTheme, PinceauTheme, PinceauThemePaths, TokensFunctionOptions } from 'pinceau'
const css = (declaration: CSS<ComponentTemplateTags__VLS, PinceauTheme>) => declaration
const $dt = (path?: PinceauThemePaths, options?: TokensFunctionOptions) => ({ path, options })
type ComponentTemplateTags__VLS = {
  /**
  * The `<button>` tag from the Vue template.
  */
  button: true,
  /**
  * The `<p>` tag from the Vue template.
  */
  p: true,
}

declare const $variantsProps: (key: keyof ComponentTemplateTags__VLS) => {}

const __VLS_css = css({
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '16px',
    width: '320px',
    height: '320px',
    border: '16px solid {colors.grey}',
    padding: '',
    position: 'relative',
    '&:hover': {
      border: '8px solid blue',
    },
    '& > p': {
      fontSize: '16px',
      textDecoration: 'underline',
    },
    variants: {
      primary: {
        backgroundColor: '{colors.primary.500}',
      },
      black: {
        backgroundColor: '{colors.black}',
      },
      lavender: {
        backgroundColor: '{colors.lavender}'
      },
      lila: {
        backgroundColor: '{colors.lila}'
      },
      velvet: {
        backgroundColor: '{colors.velvet}'
      },
      grape: {
        backgroundColor: '{colors.grape}'
      },
      rounded: {
        borderRadius: '50%'
      },
      padded: {
        padding: '4rem'
      },
    }
  }
})
