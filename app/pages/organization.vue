<template>
  <div class="space-y-8 animate-fade-in max-w-4xl mx-auto">
    <!-- Header -->
    <div>
      <Breadcrumbs :items="[
        { label: 'Home', to: '/', icon: 'i-heroicons-home' },
        { label: 'Organization', icon: 'i-heroicons-building-office' }
      ]" class="mb-2" />
      <h1 class="text-3xl font-black text-white tracking-tight">
        {{ organization?.name || 'Your Organization' }}
      </h1>
      <p class="text-zinc-500 mt-1">Manage your startup's brand, team, and subscription.</p>
    </div>

    <!-- Subscription Management -->
    <section
      class="bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 border border-accent-primary/20 rounded-2xl overflow-hidden">
      <!-- Status Header -->
      <div class="p-6 pb-4">
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="icon-[ph--credit-card-bold] text-accent-primary text-lg"></span>
              <h2 class="text-lg font-bold text-white">Subscription</h2>
            </div>
            <div class="flex items-center gap-3">
              <span class="px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider text-white">
                {{ currentPlan?.name || 'No Plan' }}
              </span>
              <span :class="statusColor" class="text-xs font-semibold">
                {{ statusLabel }}
              </span>
            </div>
            <!-- Price -->
            <p v-if="currentPlan" class="text-2xl font-black text-white mt-3">
              ${{ currentPlan.price }}<span class="text-sm font-normal text-zinc-500">/month</span>
            </p>
          </div>
          <div class="flex flex-wrap gap-3">
            <button v-if="(organization as any)?.stripeCustomerId" @click="openPortal" :disabled="isOpeningPortal"
              class="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 flex items-center gap-2">
              <span class="icon-[ph--gear-bold] text-base"></span>
              {{ isOpeningPortal ? 'Opening...' : 'Manage Billing' }}
            </button>
            <button @click="syncSubscription" :disabled="isSyncing"
              class="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 flex items-center gap-2"
              title="Refresh subscription status from Stripe">
              <span :class="['icon-[ph--arrows-clockwise-bold] text-base', isSyncing ? 'animate-spin' : '']"></span>
              {{ isSyncing ? 'Syncing...' : 'Sync' }}
            </button>
            <NuxtLink to="/pricing"
              class="px-5 py-2.5 bg-accent-primary hover:bg-accent-secondary text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-accent-primary/20 flex items-center gap-2">
              <span class="icon-[ph--arrow-up-bold] text-base"></span>
              {{ (organization as any)?.stripeSubscriptionId ? 'Change Plan' : 'Subscribe' }}
            </NuxtLink>
          </div>

          <!-- Sync/Status feedback -->
          <p v-if="syncStatus" class="text-sm font-medium mt-2"
            :class="syncStatus.includes('failed') || syncStatus.includes('Error') ? 'text-red-400' : 'text-emerald-400'">
            {{ syncStatus }}
          </p>
        </div>
      </div>

      <!-- Member Capacity Bar -->
      <div class="px-6 pb-4">
        <div class="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
          <span>Team Capacity</span>
          <span class="font-mono">{{ memberCount }}/{{ (organization as any)?.maxMembers || 2 }} seats</span>
        </div>
        <div class="w-full h-2 bg-black/30 rounded-full overflow-hidden">
          <div class="h-full bg-accent-primary rounded-full transition-all duration-500"
            :style="{ width: `${Math.min((memberCount / ((organization as any)?.maxMembers || 2)) * 100, 100)}%` }">
          </div>
        </div>
      </div>

      <!-- Plan Features -->
      <div v-if="currentPlan" class="border-t border-white/5 px-6 py-4 bg-black/10">
        <p class="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">What's included</p>
        <div class="flex flex-wrap gap-x-6 gap-y-2">
          <span v-for="feature in currentPlan.features" :key="feature"
            class="flex items-center gap-1.5 text-xs text-zinc-400">
            <span class="icon-[ph--check-bold] text-emerald-400 text-[10px]"></span>
            {{ feature }}
          </span>
        </div>
      </div>

      <!-- No subscription prompt -->
      <div v-else class="border-t border-white/5 px-6 py-4 bg-black/10">
        <p class="text-sm text-zinc-400">
          <span class="icon-[ph--info-bold] text-amber-400 mr-1"></span>
          No active subscription. <NuxtLink to="/pricing" class="text-accent-primary hover:underline font-semibold">
            Choose a plan</NuxtLink> to unlock all features.
        </p>
      </div>
    </section>

    <!-- Brand Settings -->
    <section class="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 space-y-5">
      <div class="flex items-center gap-2 mb-1">
        <span class="icon-[ph--paint-brush-bold] text-accent-primary text-lg"></span>
        <h2 class="text-lg font-bold text-white">Brand</h2>
      </div>

      <form @submit.prevent="saveSettings" class="space-y-4">
        <div class="space-y-1.5">
          <label class="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">Organization Name</label>
          <input v-model="form.name" type="text" required
            class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-accent-primary transition-all"
            placeholder="e.g. ILYTAT" />
        </div>

        <div class="space-y-1.5">
          <label class="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">Logo URL</label>
          <div class="flex gap-3 items-center">
            <div
              class="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
              <img v-if="form.logo" :src="form.logo" class="h-full w-full object-contain" alt="Logo" />
              <span v-else class="icon-[ph--image-bold] text-zinc-600 text-xl"></span>
            </div>
            <input v-model="form.logo" type="url"
              class="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-accent-primary transition-all text-sm font-mono"
              placeholder="https://example.com/logo.png" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">Domain</label>
            <input v-model="form.domain" type="text"
              class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-accent-primary transition-all font-mono text-sm"
              placeholder="e.g. ilytat.com" />
          </div>
          <div class="space-y-1.5">
            <label class="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">Mission
              Statement</label>
            <input v-model="form.missionStatement" type="text"
              class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-accent-primary transition-all text-sm"
              placeholder="What does your organization aim to achieve?" />
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <span v-if="statusMessage" class="text-sm font-medium self-center"
            :class="statusMessage.includes('Error') ? 'text-red-400' : 'text-emerald-400'">
            {{ statusMessage }}
          </span>
          <button type="submit" :disabled="isSaving"
            class="px-6 py-2.5 bg-accent-primary hover:bg-accent-secondary text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-accent-primary/20 active:scale-95 disabled:opacity-50">
            {{ isSaving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </form>
    </section>

    <!-- Team Members -->
    <section class="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 space-y-5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="icon-[ph--users-bold] text-accent-primary text-lg"></span>
          <h2 class="text-lg font-bold text-white">Team</h2>
        </div>
        <span class="text-xs text-zinc-500 font-mono">
          {{ memberCount }}/{{ organization?.maxMembers || 2 }} seats
        </span>
      </div>

      <!-- Member List -->
      <div class="space-y-2">
        <div v-for="memberId in (organization?.memberIds || [])" :key="memberId"
          class="flex items-center justify-between px-4 py-3 bg-white/5 rounded-xl">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center">
              <span class="icon-[ph--user-bold] text-accent-primary text-sm"></span>
            </div>
            <div>
              <span class="text-sm font-medium text-white font-mono">{{ memberId }}</span>
              <span v-if="memberId === organization?.createdBy"
                class="ml-2 text-[9px] bg-accent-primary/20 text-accent-primary px-2 py-0.5 rounded-full font-bold uppercase">Owner</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Invite (placeholder) -->
      <div class="pt-2 border-t border-white/5">
        <p class="text-xs text-zinc-500">
          Team invitations coming soon. Members can be added once invite functionality is built.
        </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { doc, updateDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import Breadcrumbs from '~/components/ui/Breadcrumbs.vue'
import { getPlan, type PlanDefinition } from '@/config/plans'
import { Logger } from '~/utils/Logger'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const db = useFirestore()
const { user } = useUser()
const { organizationId, organization } = useOrganization()

// Redirect to setup if no organization
watch(organizationId, (id) => {
  Logger.debug('[Organization] organizationId changed', { id })
  if (!id) navigateTo('/tenant-setup')
}, { immediate: true })

// Handle checkout success redirect — sync subscription from Stripe
const route = useRoute()
const isSyncing = ref(false)

const syncSubscription = async () => {
  Logger.info('[Organization] Sync button clicked', { organizationId: organizationId.value })
  if (!organizationId.value) {
    Logger.warn('[Organization] Cannot sync — no organizationId')
    syncStatus.value = 'No organization found — create one first'
    return
  }
  isSyncing.value = true
  syncStatus.value = 'Syncing with Stripe...'
  try {
    const result = await $fetch('/api/stripe/sync', {
      method: 'POST',
      body: { organizationId: organizationId.value }
    }) as any
    Logger.info('[Organization] Sync result', result)
    if (result?.synced) {
      syncStatus.value = `✓ Synced! Plan: ${result.plan}, Status: ${result.status}`
      setTimeout(() => { syncStatus.value = '' }, 5000)
    } else {
      syncStatus.value = `No active subscription found (plan: ${result?.plan || 'none'})`
      setTimeout(() => { syncStatus.value = '' }, 5000)
    }
  } catch (e: any) {
    Logger.error('[Organization] Sync failed', e)
    syncStatus.value = 'Sync failed — ' + (e.data?.message || e.message || 'check server logs')
  } finally {
    isSyncing.value = false
  }
}

onMounted(async () => {
  Logger.debug('[Organization] Page mounted', { checkout: route.query.checkout })
  if (route.query.checkout === 'success') {
    // After checkout redirect, sync subscription status from Stripe
    await syncSubscription()
    navigateTo('/organization', { replace: true })
  }
})

const form = reactive({
  name: '',
  domain: '',
  logo: '',
  missionStatement: ''
})

const isSaving = ref(false)
const statusMessage = ref('')
const syncStatus = ref('')
const isOpeningPortal = ref(false)

const currentPlan = computed((): PlanDefinition | undefined => {
  const planId = (organization.value as any)?.plan || 'free'
  return getPlan(planId)
})

const memberCount = computed(() => (organization.value as any)?.memberIds?.length || 0)

const statusLabel = computed(() => {
  const status = (organization.value as any)?.subscriptionStatus || 'none'
  const labels: Record<string, string> = {
    active: '● Active',
    trialing: '● Trial',
    past_due: '⚠ Past Due',
    canceled: '✕ Canceled',
    none: '○ No Subscription'
  }
  return labels[status] || status
})

const statusColor = computed(() => {
  const status = (organization.value as any)?.subscriptionStatus || 'none'
  const colors: Record<string, string> = {
    active: 'text-emerald-400',
    trialing: 'text-blue-400',
    past_due: 'text-amber-400',
    canceled: 'text-red-400',
    none: 'text-zinc-500'
  }
  return colors[status] || 'text-zinc-500'
})

// Sync form with organization data
watch(organization, (t: any) => {
  if (t) {
    Logger.debug('[Organization] Organization data loaded', { name: t.name, plan: t.plan, status: t.subscriptionStatus })
    form.name = t.name || ''
    form.domain = t.domain || ''
    form.logo = t.logo || ''
    form.missionStatement = t.missionStatement || ''
  }
}, { immediate: true })

const saveSettings = async () => {
  if (!organizationId.value) return
  isSaving.value = true
  statusMessage.value = ''

  try {
    const tenantRef = doc(db, 'tenants', organizationId.value)
    await updateDoc(tenantRef, {
      name: form.name,
      domain: form.domain,
      logo: form.logo,
      missionStatement: form.missionStatement,
      updatedAt: new Date().toISOString()
    })
    Logger.info('[Organization] Settings saved', { organizationId: organizationId.value })
    statusMessage.value = 'Saved!'
    setTimeout(() => { statusMessage.value = '' }, 3000)
  } catch (e: any) {
    Logger.error('[Organization] Save failed', e)
    statusMessage.value = 'Error: ' + (e.message || 'Save failed')
  } finally {
    isSaving.value = false
  }
}

const openPortal = async () => {
  const customerId = (organization.value as any)?.stripeCustomerId
  if (!customerId) return

  isOpeningPortal.value = true
  Logger.info('[Organization] Opening Stripe portal', { customerId })
  try {
    const result = await $fetch('/api/stripe/portal', {
      method: 'POST',
      body: { stripeCustomerId: customerId }
    })
    if (result?.portalUrl) {
      window.location.href = result.portalUrl
    }
  } catch (e: any) {
    Logger.error('[Organization] Portal failed', e)
  } finally {
    isOpeningPortal.value = false
  }
}
</script>
