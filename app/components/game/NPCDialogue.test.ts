import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia, type TestingPinia } from '@pinia/testing'
import NPCDialogue from './NPCDialogue.vue'
import { useDialogueStore } from '~/stores/dialogue'
import { registerEndpoint } from '@nuxt/test-utils/runtime'

// Mock API used by the component
registerEndpoint('/api/npc/guard', {
  method: 'GET',
  handler: () => ({
    id: 'guard',
    name: 'Zoltan',
    initial_phrases: ['Hello traveler']
  })
})

registerEndpoint('/api/dialogue/interact', {
  method: 'POST',
  handler: () => ({
    success: true,
    data: {
      npc_reply: 'I replied!',
      feedback: 'Good job!',
      history: [
        { role: 'user', content: 'hello' },
        { role: 'model', content: 'I replied!' }
      ]
    }
  })
})

describe('NPCDialogue Component', () => {
  let pinia: TestingPinia

  beforeEach(() => {
    pinia = createTestingPinia({
      stubActions: false,
      initialState: {
        player: { currentNpcId: 'guard' },
        dialogue: { history: [], isPending: false, lastError: null, lastResponse: null }
      }
    })
  })

  it('should display the NPC name and their initial message', async () => {
    const wrapper = mount({
      template: '<Suspense><NPCDialogue /></Suspense>',
      components: { NPCDialogue }
    }, {
      global: {
        plugins: [pinia]
      }
    })

    // Wait for Suspense to resolve
    await new Promise(resolve => setTimeout(resolve, 0))

    // The NPC name (tag)
    expect(wrapper.find('.name-tag').text()).toBe('Zoltan')
    // The initial message
    expect(wrapper.text()).toContain('Hello traveler')
  })

  it('should show pedagogical feedback when the store has a response', async () => {
    const dialogueStore = useDialogueStore()
    dialogueStore.lastResponse = {
      feedback: 'Excellent grammar!',
      grammarScore: 0.95
    }

    const wrapper = mount({
      template: '<Suspense><NPCDialogue /></Suspense>',
      components: { NPCDialogue }
    }, {
      global: {
        plugins: [pinia]
      }
    })

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(wrapper.find('.feedback-toast').exists()).toBe(true)
    expect(wrapper.text()).toContain('Excellent grammar!')
    expect(wrapper.text()).toContain('95%')
  })

  it('should call sendMessage in the store when pressing the send button', async () => {
    const dialogueStore = useDialogueStore()
    const spy = vi.spyOn(dialogueStore, 'sendMessage')
    
    const wrapper = mount({
      template: '<Suspense><NPCDialogue /></Suspense>',
      components: { NPCDialogue }
    }, {
      global: {
        plugins: [pinia]
      }
    })

    await new Promise(resolve => setTimeout(resolve, 0))

    const input = wrapper.find('input')
    await input.setValue('Where is the castle?')
    await wrapper.find('.send-btn').trigger('click')

    expect(spy).toHaveBeenCalledWith('guard', 'Where is the castle?')
    // The input should be cleared after sending
    expect((input.element as HTMLInputElement).value).toBe('')
  })

  it('should disable input while response is pending', async () => {
    const dialogueStore = useDialogueStore()
    dialogueStore.isPending = true

    const wrapper = mount({
      template: '<Suspense><NPCDialogue /></Suspense>',
      components: { NPCDialogue }
    }, {
      global: {
        plugins: [pinia]
      }
    })

    await new Promise(resolve => setTimeout(resolve, 0))

    const input = wrapper.find('input')
    expect((input.element as HTMLInputElement).disabled).toBe(true)
    expect(wrapper.find('.send-btn').attributes('disabled')).toBeDefined()
  })
})
