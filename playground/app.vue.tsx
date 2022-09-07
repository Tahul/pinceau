
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
type __VLS_StyleScopedClasses = {};
let __VLS_styleScopedClasses!: __VLS_StyleScopedClasses | keyof __VLS_StyleScopedClasses | (keyof __VLS_StyleScopedClasses)[];
/* CSS variable injection */
/* CSS variable injection end */
declare const NuxtLayout: __VLS_types.ConvertInvalidJsxElement<
'NuxtLayout' extends keyof typeof __VLS_components ? typeof __VLS_components['NuxtLayout'] : 
'NuxtLayout' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx['NuxtLayout'] : unknown>;
__VLS_components.NuxtLayout;
__VLS_components.NuxtLayout;
__VLS_ctx.NuxtLayout;
__VLS_ctx.NuxtLayout;
declare const __VLS_0: __VLS_types.ExtractEmit2<typeof NuxtLayout>;
/* Completion: Emits */
// @ts-ignore
__VLS_0('/* __VLS_.SearchTexts.Completion.Emit.NuxtLayout */');
/* Completion: Props */
// @ts-ignore
(<NuxtLayout /* __VLS_.SearchTexts.Completion.Props.NuxtLayout *//>);
declare const Block: __VLS_types.ConvertInvalidJsxElement<
'Block' extends keyof typeof __VLS_components ? typeof __VLS_components['Block'] : 
'Block' extends keyof typeof __VLS_ctx ? typeof __VLS_ctx['Block'] : unknown>;
__VLS_components.Block;
__VLS_components.Block;
__VLS_components.Block;
__VLS_components.Block;
__VLS_components.Block;
__VLS_components.Block;
__VLS_ctx.Block;
__VLS_ctx.Block;
__VLS_ctx.Block;
__VLS_ctx.Block;
__VLS_ctx.Block;
__VLS_ctx.Block;
declare const __VLS_1: __VLS_types.ExtractEmit2<typeof Block>;
/* Completion: Emits */
// @ts-ignore
__VLS_1('/* __VLS_.SearchTexts.Completion.Emit.Block */');
/* Completion: Props */
// @ts-ignore
(<Block /* __VLS_.SearchTexts.Completion.Props.Block *//>);
{
<NuxtLayout ></NuxtLayout>;

{
<section ></section>;

{
<Block primary={true} />
}
{
<Block black={true} />
}
{
<Block lila={true} />
}
{
<Block lavender={true} />
}
{
<Block velvet={true} />
}
{
<Block grape={true} />
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
const __VLS_component = (await import('vue')).defineComponent({});
export default {} as anyimport type { TokensFunction, CSS, PinceauTheme, PinceauTheme, PinceauThemePaths, TokensFunctionOptions } from 'pinceau'
const css = (declaration: CSS<ComponentTemplateTags__VLS, PinceauTheme>) => declaration
const $dt = (path?: PinceauThemePaths, options?: TokensFunctionOptions) => ({ path, options })
type ComponentTemplateTags__VLS = {
  /**
  * The `<NuxtLayout>` tag from the Vue template.
  */
  NuxtLayout: true,
  /**
  * The `<section>` tag from the Vue template.
  */
  section: true,
  /**
  * The `<Block>` tag from the Vue template.
  */
  Block: true,
}

declare const $variantsProps: (key: keyof ComponentTemplateTags__VLS) => {}

const __VLS_css = css({
  section: {
    flex: '1',
    width: '100%',
    overflowY: 'auto',
    padding: '1rem 2rem',
    zIndex: '50',
    '& > * + *': {
      marginTop: '1rem'
    }
  }
})
