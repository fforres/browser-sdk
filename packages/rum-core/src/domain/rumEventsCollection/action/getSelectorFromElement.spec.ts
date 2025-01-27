import { createIsolatedDOM } from '../../../../test/createIsolatedDom'
import { getSelectorFromElement } from './getSelectorFromElement'

describe('getSelectorFromElement', () => {
  let isolatedDOM: ReturnType<typeof createIsolatedDOM>

  beforeEach(() => {
    isolatedDOM = createIsolatedDOM()
  })

  afterEach(() => {
    isolatedDOM.clear()
  })

  describe('ID selector', () => {
    it('should use the ID selector when the element as an ID', () => {
      expect(getSelectorFromElement(isolatedDOM.element`<div id="foo"></div>`)).toBe('#foo')
    })

    it('should not use the ID selector when the ID is not unique', () => {
      expect(getSelectorFromElement(isolatedDOM.element`<div id="foo"></div><div id="foo"></div>`)).not.toContain(
        '#foo'
      )
    })
  })

  describe('class selector', () => {
    it('should use the class selector when the element as classes', () => {
      expect(getSelectorFromElement(isolatedDOM.element`<div class="foo bar"></div>`)).toBe('BODY>DIV.bar.foo')
    })

    it('should use the class selector when siblings have the same classes but different tags', () => {
      expect(getSelectorFromElement(isolatedDOM.element`<div target class="foo"></div><span class="foo"></span>`)).toBe(
        'BODY>DIV.foo'
      )
    })

    it('should not use the class selector when siblings have the tag + classes', () => {
      expect(
        getSelectorFromElement(isolatedDOM.element`<div target class="foo"></div><div class="foo"></div>`)
      ).not.toContain('DIV.foo')
      expect(
        getSelectorFromElement(isolatedDOM.element`<div target class="foo bar"></div><div class="bar foo baz"></div>`)
      ).not.toContain('DIV.foo')
    })
  })

  describe('position selector', () => {
    it('should use nth-of-type when the element as siblings', () => {
      const html = isolatedDOM.element`<span></span><div></div><span></span><div target></div>`
      expect(getSelectorFromElement(html)).toBe('BODY>DIV:nth-of-type(2)')
    })

    it('should not use nth-of-type when the element has no siblings', () => {
      const html = isolatedDOM.element`<div></div>`
      expect(getSelectorFromElement(html)).toBe('BODY>DIV')
    })
  })

  describe('strategies priority', () => {
    it('ID selector should take precedence over class selector', () => {
      expect(getSelectorFromElement(isolatedDOM.element`<div id="foo" class="bar"></div>`)).toBe('#foo')
    })

    it('class selector should take precedence over position selector', () => {
      expect(getSelectorFromElement(isolatedDOM.element`<div class="bar"></div><div></div>`)).toBe('BODY>DIV.bar')
    })
  })

  describe('should escape CSS selectors', () => {
    it('ID selector should take precedence over class selector', () => {
      expect(
        getSelectorFromElement(isolatedDOM.element`<div id="#bar"><button target class=".foo"></button></div>`)
      ).toBe('#\\#bar>BUTTON.\\.foo')
    })
  })
})
