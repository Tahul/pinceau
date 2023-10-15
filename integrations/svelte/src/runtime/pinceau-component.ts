import type { ComputedStyleDefinition, SupportedHTMLElements, Variants } from '@pinceau/style'
import {
  SvelteComponent,
  assign,
  create_slot,
  detach,
  element,
  empty,
  exclude_internal_props,
  get_all_dirty_from_scope,
  get_slot_changes,
  get_spread_update,
  init,
  insert,
  safe_not_equal,
  set_dynamic_element_data,
  transition_in,
  transition_out,
  update_slot_base,
} from 'svelte/internal'

import { usePinceauRuntime } from './pinceau-runtime'

export function usePinceauComponent<T extends {}>(type?: SupportedHTMLElements, staticClass?: string | undefined, computedStyles?: [string, ComputedStyleDefinition][], variants?: Variants) {
  function create_dynamic_element(ctx) {
    let svelte_element
    let current
    const default_slot_template = /* #slots */ ctx[6].default
    const default_slot = create_slot(default_slot_template, ctx, /* $$scope */ ctx[5], null)
    const svelte_element_levels = [{ class: /* pinceauClasses */ ctx[1] }]
    let svelte_element_data = {}

    for (let i = 0; i < svelte_element_levels.length; i += 1) {
      svelte_element_data = assign(svelte_element_data, svelte_element_levels[i])
    }

    return {
      c() {
        svelte_element = element(/* tag */ ctx[0])
        if (default_slot) { default_slot.c() }
        set_dynamic_element_data(/* tag */ ctx[0])(svelte_element, svelte_element_data)
      },
      m(target, anchor) {
        insert(target, svelte_element, anchor)

        if (default_slot) {
          default_slot.m(svelte_element, null)
        }

        current = true
      },
      p(ctx, dirty) {
        if (default_slot) {
          if (default_slot.p && (!current || dirty & /* $$scope */ 32)) {
            update_slot_base(
              default_slot,
              default_slot_template,
              ctx,
              /* $$scope */ ctx[5],
              !current
                ? get_all_dirty_from_scope(/* $$scope */ ctx[5])
                : get_slot_changes(default_slot_template, /* $$scope */ ctx[5], dirty, null),
              null,
            )
          }
        }

        set_dynamic_element_data(/* tag */ ctx[0])(svelte_element, svelte_element_data = get_spread_update(svelte_element_levels, [
          (!current || dirty & /* pinceauClasses */ 2) && { class: /* pinceauClasses */ ctx[1] },
        ]))
      },
      i(local) {
        if (current) { return }
        transition_in(default_slot, local)
        current = true
      },
      o(local) {
        transition_out(default_slot, local)
        current = false
      },
      d(detaching) {
        if (detaching) {
          detach(svelte_element)
        }

        if (default_slot) { default_slot.d(detaching) }
      },
    }
  }

  function create_fragment(ctx) {
    let previous_tag = /* tag */ ctx[0]
    let svelte_element_anchor
    let current
    let svelte_element = /* tag */ ctx[0] && create_dynamic_element(ctx)

    return {
      c() {
        if (svelte_element) { svelte_element.c() }
        svelte_element_anchor = empty()
      },
      m(target, anchor) {
        if (svelte_element) { svelte_element.m(target, anchor) }
        insert(target, svelte_element_anchor, anchor)
        current = true
      },
      p(ctx, [dirty]) {
        if (/* tag */ ctx[0]) {
          if (!previous_tag) {
            svelte_element = create_dynamic_element(ctx)
            previous_tag = /* tag */ ctx[0]
            svelte_element.c()
            svelte_element.m(svelte_element_anchor.parentNode, svelte_element_anchor)
          }
          else if (safe_not_equal(previous_tag, /* tag */ ctx[0])) {
            svelte_element.d(1)
            svelte_element = create_dynamic_element(ctx)
            previous_tag = /* tag */ ctx[0]
            svelte_element.c()
            svelte_element.m(svelte_element_anchor.parentNode, svelte_element_anchor)
          }
          else {
            svelte_element.p(ctx, dirty)
          }
        }
        else if (previous_tag) {
          svelte_element.d(1)
          svelte_element = null
          previous_tag = /* tag */ ctx[0]
        }
      },
      i(local) {
        if (current) { return }
        transition_in(svelte_element, local)
        current = true
      },
      o(local) {
        transition_out(svelte_element, local)
        current = false
      },
      d(detaching) {
        if (detaching) {
          detach(svelte_element_anchor)
        }

        if (svelte_element) { svelte_element.d(detaching) }
      },
    }
  }

  function instance($$self, $$props, $$invalidate) {
    let pinceauClasses
    let { $$slots: slots = {}, $$scope } = $$props
    let { tag } = $$props
    let { staticClass } = $$props
    let { computedStyles } = $$props
    let { variants } = $$props

    $$self.$$set = ($$new_props) => {
      $$invalidate(7, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)))
      if ('tag' in $$new_props) { $$invalidate(0, tag = $$new_props.tag) }
      if ('staticClass' in $$new_props) { $$invalidate(2, staticClass = $$new_props.staticClass) }
      if ('computedStyles' in $$new_props) { $$invalidate(3, computedStyles = $$new_props.computedStyles) }
      if ('variants' in $$new_props) { $$invalidate(4, variants = $$new_props.variants) }
      if ('$$scope' in $$new_props) { $$invalidate(5, $$scope = $$new_props.$$scope) }
    }

    $$self.$$.update = () => {
    // eslint-disable-next-line no-restricted-syntax,no-labels
      $: $$invalidate(1, pinceauClasses = usePinceauRuntime(staticClass, computedStyles, variants, $$props))
    }

    $$props = exclude_internal_props($$props)
    return [tag, pinceauClasses, staticClass, computedStyles, variants, $$scope, slots]
  }

  const component = class PinceauSvelteComponent extends SvelteComponent {
    static localVariants: Variants

    constructor(options) {
      super()

      options.props = {
        ...options.props,
        staticClass,
        computedStyles,
        variants,
        tag: type,
      }

      init(this, options, instance, create_fragment, safe_not_equal, {
        tag: 0,
        staticClass: 2,
        computedStyles: 3,
        variants: 4,
      })
    }

    static withVariants(_variants: Variants) {
      this.localVariants = { ...variants, ..._variants }
      return component
    }
  }

  return component
}
