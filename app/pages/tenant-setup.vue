<template>
  <div class="space-y-8 animate-fade-in max-w-3xl mx-auto">
    <!-- Already has a tenant — redirect to organization page -->
    <div v-if="isOwner" class="text-center py-16">
      <span class="icon-[ph--check-circle-bold] text-emerald-400 text-5xl mb-4 block"></span>
      <h1 class="text-2xl font-bold text-white mb-2">You already have an organization</h1>
      <p class="text-zinc-400 mb-6">Manage your organization from the dashboard.</p>
      <NuxtLink to="/organization"
        class="px-6 py-3 bg-accent-primary text-white font-bold rounded-xl transition-all hover:bg-accent-secondary">
        Go to Organization
      </NuxtLink>
    </div>

    <!-- Member of a tenant (not owner) — view-only -->
    <div v-else-if="isMemberOnly" class="text-center py-16">
      <span class="icon-[ph--users-bold] text-blue-400 text-5xl mb-4 block"></span>
      <h1 class="text-2xl font-bold text-white mb-2">You're a member of {{ tenant?.name || 'an organization' }}</h1>
      <p class="text-zinc-400 mb-2">
        You can't create a new organization while you're a member of one.
      </p>
      <p class="text-zinc-500 text-sm">
        Contact your organization owner to leave, or ask them to manage settings.
      </p>
    </div>

    <!-- No tenant — show creation form -->
    <template v-else>
      <!-- Header -->
      <div>
        <Breadcrumbs :items="[
          { label: 'Home', to: '/', icon: 'i-heroicons-home' },
          { label: 'Create Organization', icon: 'i-heroicons-building-office' }
        ]" class="mb-2" />
        <h1 class="text-3xl font-black text-white tracking-tight">
          Create Your Organization
        </h1>
        <p class="text-zinc-500 mt-1">
          Set up your startup workspace — your digital binder for building your LLC.
        </p>
        <p class="text-amber-400/80 text-sm mt-2 flex items-center gap-1">
          <span class="icon-[ph--info-bold]"></span>
          A paid subscription is required to create an organization.
          <NuxtLink to="/pricing" class="underline hover:text-amber-300 ml-1">View plans</NuxtLink>
        </p>
      </div>

      <!-- Creation Form -->
      <form @submit.prevent="createTenant" class="space-y-8">
        <!-- Brand Section -->
        <section class="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 space-y-5">
          <div class="flex items-center gap-2 mb-1">
            <span class="icon-[ph--paint-brush-bold] text-accent-primary text-lg"></span>
            <h2 class="text-lg font-bold text-white">Brand</h2>
          </div>

          <div class="space-y-4">
            <div class="space-y-1.5">
              <label class="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                Organization Name
              </label>
              <input v-model="form.name" type="text" required
                class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-accent-primary transition-all"
                placeholder="e.g. ILYTAT, Acme Labs" />
            </div>

            <div class="space-y-1.5">
              <label class="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                Logo URL <span class="text-zinc-600 normal-case">(optional)</span>
              </label>
              <div class="flex gap-3 items-center">
                <div
                  class="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                  <img v-if="form.logo" :src="form.logo" class="h-full w-full object-contain" alt="Logo preview" />
                  <span v-else class="icon-[ph--image-bold] text-zinc-600 text-xl"></span>
                </div>
                <input v-model="form.logo" type="url"
                  class="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-accent-primary transition-all text-sm font-mono"
                  placeholder="https://example.com/logo.png" />
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                Domain <span class="text-zinc-600 normal-case">(optional)</span>
              </label>
              <input v-model="form.domain" type="text"
                class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-accent-primary transition-all font-mono text-sm"
                placeholder="e.g. ilytat.com" />
            </div>
          </div>
        </section>

        <!-- Identity Section -->
        <section class="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 space-y-5">
          <div class="flex items-center gap-2 mb-1">
            <span class="icon-[ph--target-bold] text-accent-primary text-lg"></span>
            <h2 class="text-lg font-bold text-white">Identity</h2>
          </div>

          <div class="space-y-4">
            <div class="space-y-1.5">
              <label class="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                Mission Statement <span class="text-zinc-600 normal-case">(optional)</span>
              </label>
              <textarea v-model="form.missionStatement" rows="3"
                class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-accent-primary transition-all"
                placeholder="What does your organization aim to achieve?" />
            </div>
          </div>
        </section>

        <!-- Actions -->
        <div class="flex items-center justify-between">
          <p v-if="statusMessage" class="text-sm font-medium animate-pulse"
            :class="statusMessage.includes('Error') ? 'text-red-400' : 'text-emerald-400'">
            {{ statusMessage }}
          </p>
          <span v-else />

          <button type="submit" :disabled="isCreating"
            class="px-8 py-3 bg-accent-primary hover:bg-accent-secondary text-white font-bold rounded-xl transition-all shadow-xl shadow-accent-primary/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
            {{ isCreating ? 'Creating...' : 'Create Organization' }}
          </button>
        </div>
      </form>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Logger } from '~/utils/Logger';
import { ref, reactive, computed } from 'vue'
import { doc, setDoc, updateDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import Breadcrumbs from '~/components/ui/Breadcrumbs.vue'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const db = useFirestore()
const { user } = useUser()
const { organizationId, organization, isOrgMember } = useOrganization()
const tenantId = organizationId
const tenant = organization
const isTenantMember = isOrgMember

/**
 * Guard logic:
 * - Owner: has tenant and is the creator → redirect to /organization
 * - Member: has tenant but is NOT the creator → blocked from creating
 * - None: no tenant → show creation form
 */
const isOwner = computed(() => {
  return !!tenant.value && (tenant.value as any).createdBy === user.value?.uid
})

const isMemberOnly = computed(() => {
  return isTenantMember.value && !isOwner.value
})

const form = reactive({
  name: '',
  domain: '',
  logo: '',
  missionStatement: ''
})

const isCreating = ref(false)
const statusMessage = ref('')

const createTenant = async () => {
  if (!user.value?.uid) return
  if (isTenantMember.value) {
    statusMessage.value = 'Error: You are already a member of an organization.'
    return
  }

  isCreating.value = true
  statusMessage.value = ''

  try {
    // Generate slug from name
    const slug = form.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    const newTenantId = slug || `tenant-${user.value.uid.substring(0, 8)}`
    const tenantRef = doc(db, 'tenants', newTenantId)

    await setDoc(tenantRef, {
      name: form.name,
      domain: form.domain,
      logo: form.logo,
      missionStatement: form.missionStatement,
      pillars: [],
      coreValues: [],
      createdBy: user.value.uid,
      memberIds: [user.value.uid],
      plan: 'free',
      subscriptionStatus: 'none',
      stripeCustomerId: '',
      stripeSubscriptionId: '',
      maxMembers: 2,
      quickLaunch: {},
      filesUrl: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    // Link user to tenant
    const userRef = doc(db, 'users', user.value.uid)
    await updateDoc(userRef, { tenantId: newTenantId })

    statusMessage.value = 'Organization created!'
    // Redirect to pricing to subscribe
    await navigateTo('/pricing')
  } catch (e: any) {
    Logger.error('Failed to create tenant:', e)
    statusMessage.value = 'Error: ' + (e.message || 'Failed to create')
  } finally {
    isCreating.value = false
  }
}
</script>
