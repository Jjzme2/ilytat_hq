// @vitest-environment happy-dom

import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import DocumentCreator from '../DocumentCreator.vue';
import { DocumentFactory } from '../../../utils/DocumentFactory';

// Mock DocumentFactory since it's used in the component
vi.mock('../../../utils/DocumentFactory', () => ({
  DocumentFactory: {
    compile: vi.fn((template, data) => template),
    extractVariables: vi.fn(() => ['clientName', 'projectDescription']),
    print: vi.fn(),
  },
}));

// Mock documentTemplates config
vi.mock('../../../config/documentTemplates', () => ({
  documentTemplates: [
    {
      name: 'Test Template',
      type: 'proposal',
      content: 'Hello {{clientName}}, here is the {{projectDescription}}.',
    },
  ],
  DocumentTemplateModel: class {},
}));

describe('DocumentCreator', () => {
  it('renders template selection with associated label', async () => {
    const wrapper = mount(DocumentCreator);

    // Find the label for the template select
    const label = wrapper.find('label');
    // Note: Use a more specific selector if there are multiple labels
    const select = wrapper.find('select');

    expect(label.exists()).toBe(true);
    expect(select.exists()).toBe(true);

    // Check association
    const forAttr = label.attributes('for');
    const idAttr = select.attributes('id');

    expect(forAttr).toBeTruthy();
    expect(idAttr).toBeTruthy();
    expect(forAttr).toBe(idAttr);
  });

  it('renders dynamic fields with associated labels', async () => {
    const wrapper = mount(DocumentCreator);

    // Trigger template change to load variables
    await wrapper.find('select').trigger('change');

    // Check for 'clientName' input
    const input = wrapper.find('input[type="text"]');
    expect(input.exists()).toBe(true);

    // Find label for this input. We need to find the label that has for="<input-id>"
    const inputId = input.attributes('id');
    expect(inputId).toBeTruthy();

    const label = wrapper.find(`label[for="${inputId}"]`);
    expect(label.exists()).toBe(true);
    expect(label.text()).toContain('Client Name');
  });

  it('renders print button with accessible name', async () => {
    const wrapper = mount(DocumentCreator);

    // Find the print button (icon-only button)
    // It's the second button in the preview toolbar.
    // We can identify it by the click handler or icon class if needed, or by title "Print"
    const printButton = wrapper.find('button[title="Print"]');
    expect(printButton.exists()).toBe(true);

    expect(printButton.attributes('aria-label')).toBe('Print document');
  });

  it('shows loading state on Save button when isLoading is true', async () => {
    const wrapper = mount(DocumentCreator, {
      props: {
        isLoading: true,
      },
    });

    const saveButton = wrapper.findAll('button').filter(b => b.text().includes('Save') || b.text().includes('Saving'))[0];

    expect(saveButton.attributes('disabled')).toBeDefined();
    expect(saveButton.text()).toContain('Saving...');
    expect(saveButton.find('.i-ph-spinner-gap').exists()).toBe(true);
  });
});
