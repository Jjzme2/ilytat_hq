<template>
    <div class="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 p-4 relative overflow-hidden">
        <!-- Background Effects -->
        <div class="absolute inset-0 z-0">
             <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]"></div>
             <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]"></div>
        </div>

        <div class="w-full max-w-md relative z-10">
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 inline-block">
                    HQ.ILYTAT
                </h1>
                <p class="text-zinc-500 text-sm mt-2">Digital Product Studio OS</p>
            </div>
            
            <slot />
        </div>
        <ClientOnly>
            <ToastContainer />
        </ClientOnly>
    </div>
</template>
