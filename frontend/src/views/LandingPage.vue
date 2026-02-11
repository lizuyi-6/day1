<template>
  <div class="relative flex min-h-screen w-full flex-col group/design-root bg-background-light dark:bg-background-dark text-charcoal dark:text-sand font-sans antialiased overflow-x-hidden">
    <AppHeader />

    <main class="flex-grow">
      <!-- Hero -->
      <section id="hero" class="relative px-6 py-12 lg:px-20 lg:py-24 overflow-hidden">
        <div class="mx-auto max-w-[1400px]">
          <div class="grid lg:grid-cols-12 gap-12 items-center">
            <div class="lg:col-span-5 flex flex-col gap-10 z-10">
              <span class="uppercase tracking-[0.2em] text-xs font-bold text-khaki">重新定义工作流</span>
              <h1 class="font-serif text-5xl lg:text-7xl font-medium leading-[1.15] tracking-tight text-charcoal dark:text-white">
                意之所至，<br/>
                <span class="italic text-primary inline-block mt-2">AI相随</span>
              </h1>
              <p class="text-lg text-khaki dark:text-sand/80 font-normal leading-loose tracking-wide max-w-md mt-6">
                在直观的画布上构建强大的AI工作流。简洁、优雅，为现代创作者而生。
              </p>
              <div class="flex gap-4 pt-6">
                <router-link to="/dashboard" class="flex cursor-pointer items-center justify-center rounded-full h-14 px-8 bg-charcoal dark:bg-sand text-white dark:text-charcoal text-base font-bold transition-transform active:scale-95 hover:shadow-xl tracking-wide">
                  开始探索
                </router-link>
                <button class="flex cursor-pointer items-center justify-center rounded-full h-14 w-14 border border-sand dark:border-khaki hover:bg-sand/20 transition-colors">
                  <span class="material-symbols-outlined">play_arrow</span>
                </button>
              </div>
            </div>
            <div class="lg:col-span-7 relative h-[500px] lg:h-[600px] w-full">
              <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-sand/40 to-primary/10 rounded-full blur-3xl -z-10"></div>
              <div class="w-full h-full relative rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-[#2a241e] group border border-white/20">
                <div class="absolute inset-0 bg-gradient-to-br from-sand/30 via-primary/10 to-white/40 dark:from-sand/20 dark:via-primary/5 dark:to-white/10 opacity-90 transition-transform duration-[20s] ease-linear group-hover:scale-105"></div>

                <!-- Processing Stream Header -->
                <div class="absolute top-0 left-0 right-0 p-8 z-20">
                  <div class="flex justify-between items-center mb-3">
                    <span class="text-[10px] font-bold tracking-[0.2em] uppercase text-charcoal/50 dark:text-white/50">处理中</span>
                    <div class="flex items-center gap-2">
                      <div class="size-1.5 rounded-full bg-primary animate-pulse"></div>
                      <span class="text-[10px] font-bold tracking-wider uppercase text-primary">实时</span>
                    </div>
                  </div>
                  <div class="h-1 w-full bg-sand/30 dark:bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                    <div class="h-full w-2/3 bg-gradient-to-r from-primary/0 via-primary to-white rounded-full relative shadow-[0_0_15px_rgba(230,128,25,0.6)]">
                      <div class="absolute right-0 top-1/2 -translate-y-1/2 size-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.9)]"></div>
                    </div>
                  </div>
                </div>

                <!-- SVG Flow Animation Layer -->
                <div class="absolute inset-0 pointer-events-none z-10 mix-blend-overlay">
                  <svg class="w-full h-full" fill="none" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
                    <path class="opacity-60" d="M-50 450 C 150 450, 200 300, 400 300 S 650 150, 850 150" stroke="url(#grad-flow)" stroke-dasharray="4 6" stroke-width="1.5"></path>
                    <circle class="drop-shadow-[0_0_8px_rgba(230,128,25,0.8)] opacity-90" cx="400" cy="300" fill="#e68019" r="4"></circle>
                    <circle cx="380" cy="305" fill="#e68019" fill-opacity="0.6" r="3"></circle>
                    <circle cx="360" cy="315" fill="#e68019" fill-opacity="0.3" r="2"></circle>
                    <path class="opacity-40" d="M-50 200 C 100 200, 300 350, 500 350 S 700 500, 900 500" stroke="url(#grad-flow-2)" stroke-dasharray="2 4" stroke-width="1"></path>
                    <circle class="opacity-80" cx="500" cy="350" fill="white" r="3"></circle>
                    <defs>
                      <linearGradient id="grad-flow" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stop-color="#e68019" stop-opacity="0"></stop>
                        <stop offset="50%" stop-color="#e68019" stop-opacity="1"></stop>
                        <stop offset="100%" stop-color="#e68019" stop-opacity="0"></stop>
                      </linearGradient>
                      <linearGradient id="grad-flow-2" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0"></stop>
                        <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.6"></stop>
                        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"></stop>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <!-- Rotating Card (Top Right) -->
                <div class="absolute top-32 right-12 z-20 hidden lg:block">
                  <div class="relative p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/30 shadow-2xl transform rotate-[-6deg] hover:rotate-0 transition-transform duration-500">
                    <div class="flex items-center gap-3">
                      <div class="size-8 bg-primary rounded-md flex items-center justify-center text-white shadow-[0_0_15px_rgba(230,128,25,0.4)]">
                        <span class="material-symbols-outlined text-sm">bolt</span>
                      </div>
                      <div class="flex flex-col gap-1.5">
                        <div class="h-1.5 w-16 bg-white/80 rounded-full"></div>
                        <div class="h-1.5 w-10 bg-white/40 rounded-full"></div>
                      </div>
                    </div>
                    <div class="absolute -z-10 inset-0 bg-white/5 rounded-lg blur-md transform translate-x-2 translate-y-2"></div>
                  </div>
                </div>

                <!-- Bottom Notification Card -->
                <div class="absolute bottom-10 left-10 right-10 p-6 bg-white/80 dark:bg-charcoal/80 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 z-20">
                  <div class="flex items-center gap-4 mb-4">
                    <div class="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <span class="material-symbols-outlined">auto_awesome</span>
                    </div>
                    <div>
                      <h3 class="text-sm font-bold font-serif">工作流已优化</h3>
                      <p class="text-xs text-khaki">AI建议已应用</p>
                    </div>
                  </div>
                  <div class="h-2 w-full bg-sand/30 rounded-full overflow-hidden">
                    <div class="h-full bg-primary w-3/4 rounded-full relative overflow-hidden">
                      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats / About -->
      <section id="stats" class="border-y border-sand dark:border-khaki/20 bg-white dark:bg-[#2a241e]">
        <div class="mx-auto max-w-[1400px] px-6 lg:px-20">
          <div class="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-sand dark:divide-khaki/20">
            <div v-for="(stat, index) in STATS_DATA" :key="stat.label" :class="`animate-on-scroll delay-${(index + 1) * 100}`" class="py-10 md:px-10 flex flex-col items-center text-center gap-2">
              <span class="font-serif text-4xl lg:text-5xl font-medium text-charcoal dark:text-white">{{ stat.value }}</span>
              <span class="text-sm font-medium uppercase tracking-widest text-khaki">{{ stat.label }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Manifesto / Intro -->
      <section id="manifesto" class="py-24 px-6 lg:px-20 bg-background-light dark:bg-background-dark">
        <div class="mx-auto max-w-[1400px]">
          <div class="flex flex-col lg:flex-row gap-16 mb-20">
            <div class="lg:w-1/2 animate-from-left">
              <h2 class="font-serif text-4xl lg:text-6xl font-medium leading-tight tracking-tight mb-8 text-charcoal dark:text-white">
                化繁为简，<span class="italic text-primary">行云流水</span>
              </h2>
            </div>
            <div class="lg:w-1/2 flex flex-col justify-center animate-from-right">
              <p class="text-lg lg:text-xl text-khaki dark:text-sand/80 font-normal leading-loose tracking-wide">
                我们相信，优秀的工具应当隐于无形。在Aether Flow，复杂的工作流变得优雅而直观——专注于你的想法，其他的交给我们。
              </p>
            </div>
          </div>

          <!-- Features -->
          <div id="features" class="grid md:grid-cols-3 gap-8 scroll-mt-24">
            <FeatureCard
              v-for="feature in FEATURES_DATA"
              :key="feature.title"
              :type="feature.icon === 'touch_app' ? 'tactile' : feature.icon === 'hub' ? 'connectors' : 'layouts'"
              :icon="feature.icon"
              :title="feature.title"
              :description="feature.description"
            />
          </div>
        </div>
      </section>

      <section class="py-24 px-6 lg:px-20 bg-white dark:bg-[#1e1711]">
        <div class="mx-auto max-w-[1400px]">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-8">
            <div class="flex flex-col group cursor-pointer animate-scale-in delay-100 hover-enhanced rounded-3xl overflow-hidden hover:bg-white dark:hover:bg-white/5 transition-colors">
              <!-- ... images kept same ... -->
               <div class="overflow-hidden aspect-[4/5] relative">
                <div class="w-full h-full bg-center bg-cover transition-transform duration-700 group-hover:scale-105" data-alt="Abstract visualization of data logic streams in soft cream colors" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCHvcaMNXE_RQ0VTo91N8LoDvPHVVn53yITCzCylVgceNw62erRGtcViEb6cg5aPKQsGlE7EyhzyiZnTwtvSkgBfquZoChmNOVts6ar2rXzjrj2IqvwgrZ_Scw2XGNAshg-OCIjCqA4wt5dxD1ebUDfWSgHae8eSq2n7deOksVPKR_OkjV9jQVcQkNGxI4yZUe9biItBIXbL_PCGh947mN1-FX5jUsbmmRsj8ZvK6uIlTpyAn3rzYLWHG9nqIcLL_W7vjS4Xbhdan8');"></div>
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500"></div>
              </div>
              <div class="p-6">
                <span class="text-xs font-bold tracking-[0.15em] uppercase text-primary mb-3 block">工作流</span>
                <h3 class="text-2xl font-serif font-medium leading-snug tracking-tight text-charcoal dark:text-white mb-3 group-hover:text-primary transition-colors">清晰可见</h3>
                <p class="text-khaki dark:text-sand/70 leading-loose tracking-wide">数据流动、逻辑处理，一目了然。无需深究代码，可视化呈现一切。</p>
              </div>
            </div>
            <div class="flex flex-col group cursor-pointer lg:translate-y-16 animate-scale-in delay-200 hover-enhanced rounded-3xl overflow-hidden hover:bg-white dark:hover:bg-white/5 transition-colors">
               <div class="overflow-hidden aspect-[4/5] relative">
                <div class="w-full h-full bg-center bg-cover transition-transform duration-700 group-hover:scale-105" data-alt="Minimalist desk setup with tablet showing workflow diagrams" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBEtnTBcV4dZiNvNOyfsb2RYvLkEA9_KmhL4VyrrjVMjQqjAOmER7GdWPLXMxLSvDUenlHS3OyZtZ5PWtdEYFWHSZ6Hx8nDW2MiFKK-MKUeRiqR_c_-iBEdzI-1va0kxRictMG84EcYpY3OirY-4BO4gQ8aJ9pKCXDOp3LJxbp_P5RJFDJvtCkBVbAOBPE5sROnYknA9EwYgD626avbVGYalzSrPD4zaGMp5pP9dutDnTdFm6eWHic2ZxYCCVVIx9TVjB60Dks1Mx8');"></div>
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500"></div>
              </div>
              <div class="p-6">
                <span class="text-xs font-bold tracking-[0.15em] uppercase text-primary mb-3 block">连接性</span>
                <h3 class="text-2xl font-serif font-medium leading-snug tracking-tight text-charcoal dark:text-white mb-3 group-hover:text-primary transition-colors">融会贯通</h3>
                <p class="text-khaki dark:text-sand/70 leading-loose tracking-wide">各类数据源、API，拖拽即连。无需编码，集成自如。</p>
              </div>
            </div>
            <div class="flex flex-col group cursor-pointer animate-scale-in delay-300 hover-enhanced rounded-3xl overflow-hidden hover:bg-white dark:hover:bg-white/5 transition-colors">
               <div class="overflow-hidden aspect-[4/5] relative">
                <div class="w-full h-full bg-center bg-cover transition-transform duration-700 group-hover:scale-105" data-alt="Artistic rendering of digital output generation" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuDBr4c9zNlWwNVVBefmsEyooTEQorzqVc2VroBG8yddXffVqS21LDdIftlpkaWpGO1zFVBdXJsu2Tv1IdWKLAB-TLgy0aLfgGj4OD2vZuTWa0WWAlp4MSZ5mZOL9ZubLh85Hzhl79HyoU-0aJIJ1-Y_CvULHJgEnVLbTrJs-tIYbop0YG517qtHfGMlNGzA0nwY7ihlgu4bwW1s3DI-lLkHg0UqrvCZtQeM2gD-1_ORUx8cMcHUj9mac3rO4ww-ued-BWNqmbtr7yU');"></div>
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500"></div>
              </div>
              <div class="p-6">
                <span class="text-xs font-bold tracking-[0.15em] uppercase text-primary mb-3 block">结果</span>
                <h3 class="text-2xl font-serif font-medium leading-snug tracking-tight text-charcoal dark:text-white mb-3 group-hover:text-primary transition-colors">精美呈现</h3>
                <p class="text-khaki dark:text-sand/70 leading-loose tracking-wide">生成的报表与看板，专业而优雅。直接分享，无需修饰。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="py-32 px-6 lg:px-20 bg-background-light dark:bg-background-dark relative overflow-hidden">
        <div class="absolute right-0 top-0 w-1/3 h-full bg-sand/10 dark:bg-white/5 -skew-x-12 translate-x-1/2"></div>
        <div class="mx-auto max-w-[960px] text-center relative z-10 animate-on-scroll">
          <h2 class="font-serif text-5xl lg:text-7xl font-medium leading-tight tracking-tight mb-10 text-charcoal dark:text-white">
            开启你的<br/>创作之旅
          </h2>
          <p class="text-lg lg:text-xl text-khaki dark:text-sand/80 mb-14 max-w-2xl mx-auto font-normal leading-loose tracking-wide">
            十万创作者的选择，现在加入也不迟
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <router-link to="/dashboard" class="flex min-w-[160px] cursor-pointer items-center justify-center rounded-full h-14 px-8 bg-primary hover:bg-primary/90 text-white text-lg font-bold transition-all shadow-lg hover:shadow-primary/30 tracking-wide">
              开始探索
            </router-link>
            <button class="flex min-w-[160px] cursor-pointer items-center justify-center rounded-full h-14 px-8 bg-white border border-sand text-charcoal hover:bg-sand/20 font-medium transition-colors tracking-wide">
              观看演示
            </button>
          </div>
        </div>
      </section>
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import FeatureCard from '@/components/FeatureCard.vue'
import { FEATURES_DATA, STATS_DATA } from '@/config/navigation'
import { useScrollAnimations } from '@/composables/useScrollAnimations'

// 启用滚动动画
useScrollAnimations()

onMounted(() => {
  // 页面加载时的初始动画
  document.body.classList.add('page-loaded')
})
</script>
