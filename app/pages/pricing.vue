<template>
  <div class="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
    <!-- Background Glow Effects -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px]"></div>
      <div class="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[150px]"></div>
    </div>

    <div class="max-w-6xl mx-auto px-6 py-16 space-y-14 relative z-10">
      <!-- Header -->
      <div class="text-center space-y-4">
        <div
          class="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">
          <span class="icon-[ph--sparkle-bold] text-amber-400"></span>
          Simple Pricing
        </div>
        <h1
          class="text-4xl md:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
          Choose Your Plan
        </h1>
        <p class="text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Your digital binder for building your LLC. Start lean, scale when you're ready.
        </p>
      </div>

      <!-- Plan Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 items-start">
        <div v-for="plan in plans" :key="plan.id" :class="[
          'group relative flex flex-col rounded-2xl transition-all duration-500',
          plan.recommended
            ? 'md:-mt-4 md:mb-4'
            : ''
        ]">
          <!-- Animated Gradient Border (recommended only) -->
          <div v-if="plan.recommended"
            class="absolute -inset-[1px] bg-gradient-to-b from-accent-primary via-purple-500 to-accent-secondary rounded-2xl opacity-60 blur-[1px] group-hover:opacity-80 transition-opacity">
          </div>

          <!-- Card Body -->
          <div :class="[
            'relative flex flex-col h-full rounded-2xl p-7 backdrop-blur-xl border overflow-hidden',
            plan.recommended
              ? 'bg-zinc-900/80 border-transparent'
              : 'bg-zinc-900/40 border-white/5 hover:border-white/10'
          ]">
            <!-- Hover Glow Overlay -->
            <div :class="[
              'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none',
              plan.id === 'starter' ? 'bg-gradient-to-br from-emerald-500/5 to-transparent' : '',
              plan.id === 'growth' ? 'bg-gradient-to-br from-purple-500/5 to-blue-500/5' : '',
              plan.id === 'scale' ? 'bg-gradient-to-br from-amber-500/5 to-transparent' : ''
            ]"></div>

            <!-- Recommended Badge -->
            <div v-if="plan.recommended"
              class="absolute top-0 right-0 px-4 py-1.5 bg-gradient-to-r from-accent-primary to-purple-500 text-white text-[9px] font-black uppercase tracking-widest rounded-bl-xl rounded-tr-xl">
              Most Popular
            </div>

            <!-- Plan Icon + Name -->
            <div class="relative z-10 mb-5">
              <div :class="[
                'w-11 h-11 rounded-xl flex items-center justify-center mb-4 border',
                plan.id === 'starter' ? 'bg-emerald-500/10 border-emerald-500/20' : '',
                plan.id === 'growth' ? 'bg-purple-500/10 border-purple-500/20' : '',
                plan.id === 'scale' ? 'bg-amber-500/10 border-amber-500/20' : ''
              ]">
                <span :class="[
                  'text-xl',
                  plan.id === 'starter' ? 'icon-[ph--rocket-launch-bold] text-emerald-400' : '',
                  plan.id === 'growth' ? 'icon-[ph--trend-up-bold] text-purple-400' : '',
                  plan.id === 'scale' ? 'icon-[ph--crown-bold] text-amber-400' : ''
                ]"></span>
              </div>
              <h2 class="text-xl font-black text-white tracking-tight">{{ plan.name }}</h2>
              <p class="text-sm text-zinc-500 mt-1 leading-relaxed">{{ plan.description }}</p>
            </div>

            <!-- Price -->
            <div class="relative z-10 flex items-baseline gap-1.5 mb-6">
              <span class="text-5xl font-black text-white tracking-tight">${{ plan.price }}</span>
              <div class="flex flex-col">
                <span class="text-zinc-500 text-xs font-semibold">/month</span>
              </div>
            </div>

            <!-- Divider -->
            <div class="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6"></div>

            <!-- Features -->
            <ul class="space-y-3 mb-8 flex-1 relative z-10">
              <li v-for="feature in plan.features" :key="feature" class="flex items-start gap-2.5 text-sm">
                <span :class="[
                  'mt-0.5 shrink-0 text-sm',
                  plan.id === 'starter' ? 'icon-[ph--check-circle-bold] text-emerald-400' : '',
                  plan.id === 'growth' ? 'icon-[ph--check-circle-bold] text-purple-400' : '',
                  plan.id === 'scale' ? 'icon-[ph--check-circle-bold] text-amber-400' : ''
                ]"></span>
                <span class="text-zinc-300">{{ feature }}</span>
              </li>
            </ul>

            <!-- CTA Button -->
            <button @click="startCheckout(plan)" :disabled="isCheckingOut" :class="[
              'relative z-10 w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
              plan.recommended
                ? 'bg-gradient-to-r from-accent-primary to-purple-500 hover:from-accent-secondary hover:to-purple-400 text-white shadow-xl shadow-accent-primary/20 hover:shadow-accent-primary/40'
                : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20'
            ]">
              {{ isCheckingOut ? 'Redirecting...' : 'Get Started' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center space-y-3">
        <p class="text-xs text-zinc-600">
          All plans include 14-day money-back guarantee. Cancel anytime.
        </p>
        <NuxtLink to="/"
          class="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors group">
          <span class="icon-[ph--arrow-left-bold] group-hover:-translate-x-1 transition-transform"></span>
          Back to Home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PLANS, type PlanDefinition } from '@/config/plans'
import { Logger } from '~/utils/Logger'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const plans = PLANS
const isCheckingOut = ref(false)
const { user } = useUser()
const { organizationId } = useOrganization()

const startCheckout = async (plan: PlanDefinition) => {
  if (!user.value?.uid) return

  isCheckingOut.value = true

  try {
    Logger.info('[Pricing] Starting checkout', { planId: plan.id, userId: user.value.uid, organizationId: organizationId.value })
    const result = await $fetch('/api/stripe/create-checkout', {
      method: 'POST',
      body: {
        planId: plan.id,
        userId: user.value.uid,
        userEmail: user.value.email,
        organizationId: organizationId.value || ''
      }
    })

    if (result?.sessionUrl) {
      Logger.info('[Pricing] Redirecting to Stripe checkout', { sessionUrl: 'present' })
      window.location.href = result.sessionUrl
    }
  } catch (err: any) {
    Logger.error('[Pricing] Checkout failed', err)
  } finally {
    isCheckingOut.value = false
  }
}
</script>
