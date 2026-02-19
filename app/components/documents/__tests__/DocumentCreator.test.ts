// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import DocumentCreator from '../DocumentCreator.vue'

describe('DocumentCreator', () => {
  it('renders correctly', () => {
    const wrapper = mount(DocumentCreator)
    expect(wrapper.exists()).toBe(true)
  })

  it('sets accessibility attributes on template select', () => {
    const wrapper = mount(DocumentCreator)
    const select = wrapper.find('select')
    const id = select.attributes('id')

    expect(id).toBeTruthy()
    const label = wrapper.find(`label[for="${id}"]`)

    expect(select.exists()).toBe(true)
    expect(label.exists()).toBe(true)
    expect(label.text()).toBe('Template')
  })

  it('sets accessibility attributes on dynamic fields', async () => {
    // Mount with a template that has variables
    // "Service Agreement" is imported in documentTemplates.ts
    const wrapper = mount(DocumentCreator, {
      props: {
        initialTemplateId: 'Service Agreement'
      }
    })

    // Wait for variables to populate (happens onMounted)
    await wrapper.vm.$nextTick()

    const inputs = wrapper.findAll('input')
    const textareas = wrapper.findAll('textarea')

    const allFields = [...inputs, ...textareas]

    if (allFields.length > 0) {
        for (const field of allFields) {
          const id = field.attributes('id')
          expect(id).toBeTruthy()
          expect(id).not.toMatch(/\s/) // Ensure no spaces in ID

          const label = wrapper.find(`label[for="${id}"]`)
          expect(label.exists()).toBe(true)
        }
    }
  })

  it('sets aria-label on print button', () => {
    const wrapper = mount(DocumentCreator)
    const printButton = wrapper.find('button[aria-label="Print document"]')
    expect(printButton.exists()).toBe(true)
  })
})
