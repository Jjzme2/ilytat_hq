<template>
    <div class="space-y-8">
        <!-- Header -->
        <div>
            <h2 class="text-2xl font-bold text-white tracking-tight">Content Generation</h2>
            <p class="text-slate-400 text-sm mt-1">Generate legal documents and policies for your organization.</p>
        </div>

        <!-- Document type selector -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
                v-for="docType in documentTypes" 
                :key="docType.id"
                @click="selectedType = docType.id"
                class="p-5 rounded-xl border transition-all duration-300 text-left group"
                :class="selectedType === docType.id 
                    ? 'bg-amber-500/10 border-amber-500/30 ring-1 ring-amber-500/20' 
                    : 'bg-white/5 border-white/10 hover:border-white/20'"
            >
                <span class="text-2xl">{{ docType.icon }}</span>
                <h3 class="text-sm font-bold text-white mt-2 uppercase tracking-wider">{{ docType.name }}</h3>
                <p class="text-xs text-slate-500 mt-1">{{ docType.description }}</p>
            </button>
        </div>

        <!-- Configuration -->
        <div v-if="selectedType" class="space-y-4 p-6 rounded-xl bg-white/5 border border-white/10">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider">Configuration</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs text-slate-400 mb-1">Organization Name</label>
                    <input v-model="orgName" type="text" placeholder="ILYTAT LLC"
                        class="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
                </div>
                <div>
                    <label class="block text-xs text-slate-400 mb-1">Contact Email</label>
                    <input v-model="contactEmail" type="email" placeholder="legal@company.com"
                        class="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
                </div>
                <div>
                    <label class="block text-xs text-slate-400 mb-1">Effective Date</label>
                    <input v-model="effectiveDate" type="date"
                        class="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
                </div>
                <div>
                    <label class="block text-xs text-slate-400 mb-1">Jurisdiction</label>
                    <select v-model="jurisdiction"
                        class="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30">
                        <option value="us">United States</option>
                        <option value="eu">European Union (GDPR)</option>
                        <option value="uk">United Kingdom</option>
                        <option value="ca">Canada</option>
                    </select>
                </div>
            </div>

            <button 
                @click="generateContent"
                :disabled="isGenerating"
                class="mt-4 px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-300"
                :class="isGenerating 
                    ? 'bg-white/5 text-slate-600 cursor-not-allowed' 
                    : 'bg-amber-500 text-black hover:bg-amber-400 shadow-lg shadow-amber-500/20'"
            >
                {{ isGenerating ? 'Generating...' : 'Generate Document' }}
            </button>
        </div>

        <!-- Generated content preview -->
        <div v-if="generatedContent" class="space-y-4">
            <div class="flex items-center justify-between">
                <h3 class="text-sm font-bold text-white uppercase tracking-wider">Generated Document</h3>
                <div class="flex gap-2">
                    <button @click="copyToClipboard" class="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-slate-400 hover:text-white hover:bg-white/10 transition">
                        📋 Copy
                    </button>
                    <button @click="saveAsDocument" class="px-3 py-1.5 rounded-lg bg-amber-500/10 text-xs text-amber-400 hover:bg-amber-500/20 transition">
                        💾 Save to Documents
                    </button>
                </div>
            </div>
            <div class="p-6 rounded-xl bg-black/40 border border-white/10 max-h-[60vh] overflow-y-auto">
                <div class="prose prose-invert prose-sm max-w-none" v-html="generatedContent" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const documentTypes = [
    { id: 'privacy', name: 'Privacy Policy', description: 'GDPR/CCPA compliant privacy policy', icon: '🔒' },
    { id: 'terms', name: 'Terms of Service', description: 'Standard terms and conditions', icon: '📜' },
    { id: 'acceptable-use', name: 'Acceptable Use', description: 'Platform usage guidelines and restrictions', icon: '⚖️' },
]

const selectedType = ref<string | null>(null)
const orgName = ref('ILYTAT LLC')
const contactEmail = ref('')
const effectiveDate = ref(new Date().toISOString().split('T')[0])
const jurisdiction = ref('us')
const isGenerating = ref(false)
const generatedContent = ref<string | null>(null)

async function generateContent() {
    if (!selectedType.value) return
    isGenerating.value = true
    generatedContent.value = null

    try {
        // Generate content based on type
        const templates = getTemplates()
        const template = templates[selectedType.value]
        if (template) {
            // Simulate generation delay for UX
            await new Promise(resolve => setTimeout(resolve, 1500))
            generatedContent.value = template
                .replace(/\{\{ORG_NAME\}\}/g, orgName.value || 'Organization')
                .replace(/\{\{CONTACT_EMAIL\}\}/g, contactEmail.value || 'contact@example.com')
                .replace(/\{\{EFFECTIVE_DATE\}\}/g, effectiveDate.value || new Date().toLocaleDateString())
                .replace(/\{\{JURISDICTION\}\}/g, getJurisdictionName())
        }
    } catch (err) {
        console.error('[AdminContent] Generation failed:', err)
    } finally {
        isGenerating.value = false
    }
}

function getJurisdictionName(): string {
    const map: Record<string, string> = {
        us: 'United States',
        eu: 'European Union',
        uk: 'United Kingdom',
        ca: 'Canada'
    }
    return map[jurisdiction.value] || 'United States'
}

function copyToClipboard() {
    if (generatedContent.value) {
        const text = generatedContent.value.replace(/<[^>]*>/g, '')
        navigator.clipboard.writeText(text)
    }
}

function saveAsDocument() {
    // Placeholder — would integrate with useDocuments composable
    alert('Document saved! (Integration with Documents module pending)')
}

function getTemplates(): Record<string, string> {
    return {
        privacy: `
<h1>Privacy Policy</h1>
<p><strong>Effective Date:</strong> {{EFFECTIVE_DATE}}</p>
<p><strong>Organization:</strong> {{ORG_NAME}}</p>

<h2>1. Information We Collect</h2>
<p>{{ORG_NAME}} ("we," "us," or "our") collects the following types of information when you use our services:</p>
<ul>
<li><strong>Account Information:</strong> Name, email address, and authentication credentials</li>
<li><strong>Usage Data:</strong> Pages visited, features used, and interaction patterns</li>
<li><strong>Device Information:</strong> Browser type, operating system, and device identifiers</li>
<li><strong>Financial Data:</strong> Account balances and transaction records (if using Finance module)</li>
</ul>

<h2>2. How We Use Your Information</h2>
<p>We use collected information to:</p>
<ul>
<li>Provide and maintain our services</li>
<li>Personalize your experience</li>
<li>Send important notices and updates</li>
<li>Analyze usage patterns to improve our platform</li>
<li>Comply with legal obligations</li>
</ul>

<h2>3. Data Sharing</h2>
<p>We do not sell your personal information. We may share data with:</p>
<ul>
<li>Service providers operating on our behalf</li>
<li>Tenant administrators (for organization-scoped data)</li>
<li>Law enforcement when required by law</li>
</ul>

<h2>4. Data Retention</h2>
<p>We retain your data for as long as your account is active or as needed to provide services. You may request deletion by contacting {{CONTACT_EMAIL}}.</p>

<h2>5. Your Rights</h2>
<p>Under applicable laws of {{JURISDICTION}}, you have the right to:</p>
<ul>
<li>Access your personal data</li>
<li>Request correction of inaccurate data</li>
<li>Request deletion of your data</li>
<li>Object to data processing</li>
<li>Data portability</li>
</ul>

<h2>6. Security</h2>
<p>We use industry-standard security measures including encryption, access controls, and regular security audits to protect your information.</p>

<h2>7. Contact</h2>
<p>For privacy-related inquiries, contact us at: <strong>{{CONTACT_EMAIL}}</strong></p>
        `,
        terms: `
<h1>Terms of Service</h1>
<p><strong>Effective Date:</strong> {{EFFECTIVE_DATE}}</p>
<p><strong>Organization:</strong> {{ORG_NAME}}</p>

<h2>1. Acceptance of Terms</h2>
<p>By accessing or using the services provided by {{ORG_NAME}}, you agree to be bound by these Terms of Service. If you do not agree, you may not use our services.</p>

<h2>2. Description of Services</h2>
<p>{{ORG_NAME}} provides a digital workspace platform including project management, financial tracking, document management, messaging, and scheduling tools.</p>

<h2>3. User Accounts</h2>
<ul>
<li>You must provide accurate information when creating an account</li>
<li>You are responsible for maintaining the security of your account credentials</li>
<li>You must notify us immediately of any unauthorized access</li>
<li>Account sharing is prohibited without explicit authorization</li>
</ul>

<h2>4. Acceptable Use</h2>
<p>You agree not to:</p>
<ul>
<li>Use the service for any unlawful purpose</li>
<li>Attempt to gain unauthorized access to other accounts or systems</li>
<li>Upload malicious code or interfere with service operations</li>
<li>Violate any applicable laws of {{JURISDICTION}}</li>
</ul>

<h2>5. Intellectual Property</h2>
<p>All content, features, and functionality of the platform are owned by {{ORG_NAME}} and protected by intellectual property laws. User-generated content remains the property of the respective users.</p>

<h2>6. Limitation of Liability</h2>
<p>{{ORG_NAME}} shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.</p>

<h2>7. Termination</h2>
<p>We reserve the right to suspend or terminate your access if you violate these terms. You may also terminate your account at any time.</p>

<h2>8. Governing Law</h2>
<p>These terms shall be governed by and construed in accordance with the laws of {{JURISDICTION}}.</p>

<h2>9. Contact</h2>
<p>For questions about these terms, contact: <strong>{{CONTACT_EMAIL}}</strong></p>
        `,
        'acceptable-use': `
<h1>Acceptable Use Policy</h1>
<p><strong>Effective Date:</strong> {{EFFECTIVE_DATE}}</p>
<p><strong>Organization:</strong> {{ORG_NAME}}</p>

<h2>1. Purpose</h2>
<p>This Acceptable Use Policy outlines the rules and guidelines for using {{ORG_NAME}}'s platform and services.</p>

<h2>2. Permitted Uses</h2>
<ul>
<li>Business project management and collaboration</li>
<li>Financial tracking and budgeting</li>
<li>Professional communication between team members</li>
<li>Document creation and management</li>
<li>Schedule and event coordination</li>
</ul>

<h2>3. Prohibited Activities</h2>
<p>Users shall not:</p>
<ul>
<li>Share login credentials or access tokens</li>
<li>Store or transmit illegal, harmful, or offensive content</li>
<li>Attempt to bypass security controls or access restrictions</li>
<li>Use automated tools to scrape or extract platform data</li>
<li>Impersonate other users or misrepresent your identity</li>
<li>Use the platform for cryptocurrency mining or similar resource-intensive activities</li>
</ul>

<h2>4. Data Handling</h2>
<ul>
<li>Sensitive financial data must only be shared with authorized team members</li>
<li>Users must report any data breaches or security incidents immediately</li>
<li>Exported data must be handled in accordance with applicable privacy laws</li>
</ul>

<h2>5. Enforcement</h2>
<p>Violations of this policy may result in:</p>
<ul>
<li>Warning notification</li>
<li>Temporary suspension of access</li>
<li>Permanent account termination</li>
<li>Legal action if warranted under laws of {{JURISDICTION}}</li>
</ul>

<h2>6. Reporting Violations</h2>
<p>Report policy violations to: <strong>{{CONTACT_EMAIL}}</strong></p>
        `
    }
}
</script>
