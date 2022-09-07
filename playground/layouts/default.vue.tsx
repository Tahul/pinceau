
const __VLS_options = {
};

const __VLS_name = undefined;
function __VLS_template() {
import * as __VLS_types from './__VLS_types.js'; import('./__VLS_types.js');
let __VLS_ctx!: __VLS_types.PickNotAny<__VLS_Ctx, {}> & InstanceType<__VLS_types.PickNotAny<typeof __VLS_component, new () => {}>> & {
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
 & { 'layout'?: boolean }
 & { 'primary'?: boolean }
 & { 'primary'?: boolean }
 & { 'primary'?: boolean }
 & { 'primary'?: boolean };
let __VLS_styleScopedClasses!: __VLS_StyleScopedClasses | keyof __VLS_StyleScopedClasses | (keyof __VLS_StyleScopedClasses)[];
/* CSS variable injection */
/* CSS variable injection end */
{
<div class={"\u006c\u0061\u0079\u006f\u0075\u0074"} ></div>;

{
<header ></header>;

{
<span ></span>;

}
}
{
<slot />
const __VLS_5 = {
};
var __VLS_6!: typeof __VLS_5;
}
{
<footer ></footer>;

{
<span ></span>;

( 'Footer' );
}
{
<span ></span>;

}
}
}
if (typeof __VLS_styleScopedClasses === 'object' && !Array.isArray(__VLS_styleScopedClasses)) {
__VLS_styleScopedClasses['layout'];
}
declare var __VLS_slots:
{
default: (_: typeof __VLS_6) => any,
};
return __VLS_slots;
}
const __VLS_component = (await import('vue')).defineComponent({});
export default {} as anyimport type { TokensFunction, CSS, PinceauTheme, PinceauTheme, PinceauThemePaths, TokensFunctionOptions } from 'pinceau'
const css = (declaration: CSS<ComponentTemplateTags__VLS, PinceauTheme>) => declaration
const $dt = (path?: PinceauThemePaths, options?: TokensFunctionOptions) => ({ path, options })
type ComponentTemplateTags__VLS = {
  /**
  * The `<div>` tag from the Vue template.
  */
  div: true,
  /**
  * The `<header>` tag from the Vue template.
  */
  header: true,
  /**
  * The `<span>` tag from the Vue template.
  */
  span: true,
  /**
  * The `<slot>` tag from the Vue template.
  */
  slot: true,
  /**
  * The `<footer>` tag from the Vue template.
  */
  footer: true,
}

declare const $variantsProps: (key: keyof ComponentTemplateTags__VLS) => {}

const __VLS_$dt_fontsPrimary_70 = $dt('fonts.primary')

const __VLS_$dt_colorsPrimary500_117 = $dt('colors.primary.500')

const __VLS_$dt_colorsPrimary200_220 = $dt('colors.primary.200')

const __VLS_$dt_colorsPrimary900_289 = $dt('colors.primary.900')

const __VLS_$dt_colorsPrimary500_473 = $dt('colors.primary.500')

const __VLS_$dt_colorsGrape_597 = $dt('colors.grape')

const __VLS_$dt_colorsBlack_795 = $dt('colors.black')
