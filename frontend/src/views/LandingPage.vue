<template>
  <div class="relative flex min-h-screen w-full flex-col group/design-root bg-background-light dark:bg-background-dark text-charcoal dark:text-sand font-sans antialiased overflow-x-hidden">
    <header class="w-full border-b border-sand/50 dark:border-khaki/20 px-6 py-6 lg:px-20 z-10 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-sm sticky top-0">
      <div class="mx-auto max-w-[1400px] flex items-center justify-between">
        <div class="flex items-center gap-4 text-charcoal dark:text-white cursor-pointer" @click="scrollToTop">
          <div class="size-8 text-primary">
            <svg class="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clip-rule="evenodd" d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z" fill="currentColor" fill-rule="evenodd"></path>
            </svg>
          </div>
          <h2 class="text-xl font-serif font-bold tracking-tight">Aether Flow</h2>
        </div>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-10">
          <a class="text-sm font-medium hover:text-primary transition-colors duration-300" href="#features" @click.prevent="scrollToSection('features')">Features</a>
          <a class="text-sm font-medium hover:text-primary transition-colors duration-300" href="#manifesto" @click.prevent="scrollToSection('manifesto')">Manifesto</a>
          <a class="text-sm font-medium hover:text-primary transition-colors duration-300" href="#stats" @click.prevent="scrollToSection('stats')">About</a>
          <a class="text-sm font-medium hover:text-primary transition-colors duration-300" href="#footer" @click.prevent="scrollToSection('footer')">Journal</a>
        </nav>

        <router-link to="/app" class="hidden md:flex cursor-pointer items-center justify-center rounded-full h-10 px-6 bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-all duration-300 shadow-md hover:shadow-lg">
          <span>Get Started</span>
        </router-link>

        <!-- Mobile Menu Button -->
        <button class="md:hidden text-charcoal dark:text-white z-50 relative" @click="toggleMenu">
          <span class="material-symbols-outlined">{{ isMenuOpen ? 'close' : 'menu' }}</span>
        </button>
      </div>

      <!-- Mobile Menu Overlay -->
      <div v-show="isMenuOpen" class="fixed inset-0 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md z-40 flex flex-col items-center justify-center gap-8 md:hidden transition-all duration-300">
        <a class="text-2xl font-serif font-medium text-charcoal dark:text-white" href="#features" @click.prevent="scrollToSection('features', true)">Features</a>
        <a class="text-2xl font-serif font-medium text-charcoal dark:text-white" href="#manifesto" @click.prevent="scrollToSection('manifesto', true)">Manifesto</a>
        <a class="text-2xl font-serif font-medium text-charcoal dark:text-white" href="#stats" @click.prevent="scrollToSection('stats', true)">About</a>
        <a class="text-2xl font-serif font-medium text-charcoal dark:text-white" href="#footer" @click.prevent="scrollToSection('footer', true)">Journal</a>
        <router-link to="/app" class="cursor-pointer items-center justify-center rounded-full h-12 px-8 bg-primary text-white text-lg font-bold shadow-lg" @click="isMenuOpen = false">
          Get Started
        </router-link>
      </div>
    </header>

    <main class="flex-grow">
      <!-- Hero -->
      <section id="hero" class="relative px-6 py-12 lg:px-20 lg:py-24 overflow-hidden">
        <div class="mx-auto max-w-[1400px]">
          <div class="grid lg:grid-cols-12 gap-12 items-center">
            <div class="lg:col-span-5 flex flex-col gap-8 z-10">
              <span class="uppercase tracking-[0.2em] text-xs font-bold text-khaki">The New Standard</span>
              <h1 class="font-serif text-5xl lg:text-7xl font-medium leading-[1.1] text-charcoal dark:text-white">
                Design with <br/><span class="italic text-primary">Intention</span>
              </h1>
              <p class="text-lg text-khaki dark:text-sand/80 font-light leading-relaxed max-w-md">
                Build powerful AI workflows in a canvas that feels like a design studio. Warm, intuitive, and beautifully structured for the modern creator.
              </p>
              <div class="flex gap-4 pt-4">
                <router-link to="/app" class="flex cursor-pointer items-center justify-center rounded-full h-14 px-8 bg-charcoal dark:bg-sand text-white dark:text-charcoal text-base font-bold transition-transform active:scale-95 hover:shadow-xl">
                  Start Building
                </router-link>
                <button class="flex cursor-pointer items-center justify-center rounded-full h-14 w-14 border border-sand dark:border-khaki hover:bg-sand/20 transition-colors">
                  <span class="material-symbols-outlined">play_arrow</span>
                </button>
              </div>
            </div>
            <div class="lg:col-span-7 relative h-[500px] lg:h-[600px] w-full">
              <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-sand/40 to-primary/10 rounded-full blur-3xl -z-10"></div>
              <div class="w-full h-full relative rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-[#2a241e] group border border-white/20">
                <div class="absolute inset-0 bg-center bg-cover opacity-90 transition-transform duration-[20s] ease-linear group-hover:scale-105" data-alt="Minimalist abstract UI interface with soft shadows and flowing lines" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuDyq4mP_qcAZe3xxa1H4u1QgH01i4beQcqnk-2Z-4cJ3Y37pgraVPyzBXLfOEO-PgP1b2DMxPwomQKYX1kbI6wLsfDS4k0NPTt8URN5PQzV9YRW2HohzApC3UT6Z7dPuA36V77S2URU0uK4t7-LONan_WvyYhg8qqsqGPj1QdrYzLhiAr0Hgmgctbt0crUHXEGi-ouGcjj2ACy0e06KTB9NV3476Y4F_kj2puMPoKO6hLwFEpDAK9-PFL-QaWa0SJNXZ5HU_N6AUCY');">
                </div>

                <!-- Processing Stream Header -->
                <div class="absolute top-0 left-0 right-0 p-8 z-20">
                  <div class="flex justify-between items-center mb-3">
                    <span class="text-[10px] font-bold tracking-[0.2em] uppercase text-charcoal/50 dark:text-white/50">Processing Stream</span>
                    <div class="flex items-center gap-2">
                      <div class="size-1.5 rounded-full bg-primary animate-pulse"></div>
                      <span class="text-[10px] font-bold tracking-wider uppercase text-primary">Live</span>
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
                      <h3 class="text-sm font-bold font-serif">Workflow Optimized</h3>
                      <p class="text-xs text-khaki">AI suggestions active</p>
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
            <div class="py-10 md:px-10 flex flex-col items-center text-center gap-2">
              <span class="font-serif text-4xl lg:text-5xl font-medium text-charcoal dark:text-white">10k+</span>
              <span class="text-sm font-medium uppercase tracking-widest text-khaki">Active Workflows</span>
            </div>
            <div class="py-10 md:px-10 flex flex-col items-center text-center gap-2">
              <span class="font-serif text-4xl lg:text-5xl font-medium text-charcoal dark:text-white">40%</span>
              <span class="text-sm font-medium uppercase tracking-widest text-khaki">Hours Saved Weekly</span>
            </div>
            <div class="py-10 md:px-10 flex flex-col items-center text-center gap-2">
              <span class="font-serif text-4xl lg:text-5xl font-medium text-charcoal dark:text-white">No. 1</span>
              <span class="text-sm font-medium uppercase tracking-widest text-khaki">Design Tool 2024</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Manifesto / Intro -->
      <section id="manifesto" class="py-24 px-6 lg:px-20 bg-background-light dark:bg-background-dark">
        <div class="mx-auto max-w-[1400px]">
          <div class="flex flex-col lg:flex-row gap-16 mb-20">
            <div class="lg:w-1/2">
              <h2 class="font-serif text-4xl lg:text-6xl font-medium leading-tight mb-6 text-charcoal dark:text-white">
                The Art of <br/><span class="italic text-primary">Automation</span>
              </h2>
            </div>
            <div class="lg:w-1/2 flex flex-col justify-end">
              <p class="text-lg lg:text-xl text-khaki dark:text-sand/80 font-light leading-relaxed">
                Aether Flow transforms complex logic into elegant visual streams. Experience a tool where form meets function, designed for those who value clarity above all else.
              </p>
            </div>
          </div>

          <!-- Features -->
          <div id="features" class="grid md:grid-cols-3 gap-8 scroll-mt-24">
            <div class="group p-8 rounded-2xl bg-white dark:bg-[#2a241e] border border-transparent hover:border-sand transition-all duration-300 shadow-sm hover:shadow-md">
              <div class="h-16 mb-4 flex items-center gap-2 overflow-hidden relative">
                <div class="size-10 border border-dashed border-sand dark:border-white/20 rounded flex items-center justify-center opacity-40 grayscale group-hover:opacity-20 transition-opacity">
                  <span class="material-symbols-outlined text-lg">crop_square</span>
                </div>
                <div class="h-[1px] w-6 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                <div class="size-10 bg-primary text-white rounded shadow-xl flex items-center justify-center transform -translate-y-1 rotate-3 group-hover:scale-110 transition-transform duration-500 z-10">
                  <span class="material-symbols-outlined text-lg">touch_app</span>
                </div>
                <div class="absolute left-[4.5rem] w-12 h-[1px] bg-primary/20 -z-10 group-hover:w-20 transition-all duration-500"></div>
                <div class="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white dark:from-[#2a241e] to-transparent z-20"></div>
              </div>
              <h3 class="text-xl font-serif font-bold mb-3 text-charcoal dark:text-white">Tactile Interaction</h3>
              <p class="text-khaki dark:text-sand/70">Drag and drop with satisfying physics and weight. Every interaction feels deliberate and grounded.</p>
            </div>
            <div class="group p-8 rounded-2xl bg-white dark:bg-[#2a241e] border border-transparent hover:border-sand transition-all duration-300 shadow-sm hover:shadow-md">
              <div class="h-16 mb-4 flex items-center w-full">
                <div class="relative w-full max-w-[160px] h-8 flex items-center justify-between">
                  <div class="size-3 rounded-full bg-charcoal dark:bg-sand z-10 group-hover:ring-4 ring-primary/10 transition-all"></div>
                  <div class="absolute inset-0 flex items-center px-1">
                    <div class="h-0.5 w-full bg-sand/50 dark:bg-white/10">
                      <div class="h-full w-2/3 bg-primary rounded-full relative group-hover:w-full transition-all duration-1000 ease-out">
                        <div class="absolute right-0 top-1/2 -translate-y-1/2 size-2 bg-primary blur-[2px] opacity-80"></div>
                      </div>
                    </div>
                  </div>
                  <div class="size-3 rounded-full border-2 border-dashed border-primary z-10 bg-white dark:bg-[#2a241e]"></div>
                </div>
              </div>
              <h3 class="text-xl font-serif font-bold mb-3 text-charcoal dark:text-white">Smart Connectors</h3>
              <p class="text-khaki dark:text-sand/70">AI that anticipates your next move and suggests connections before you even think of them.</p>
            </div>
            <div class="group p-8 rounded-2xl bg-white dark:bg-[#2a241e] border border-transparent hover:border-sand transition-all duration-300 shadow-sm hover:shadow-md">
              <div class="h-16 mb-4 flex items-end gap-1.5">
                <div class="w-6 h-8 bg-sand/30 dark:bg-white/10 rounded-sm"></div>
                <div class="w-6 h-10 bg-sand/30 dark:bg-white/10 rounded-sm"></div>
                <div class="w-6 h-12 bg-primary/20 border border-primary rounded-sm shadow-lg mb-2 backdrop-blur-sm group-hover:-translate-y-1 transition-transform duration-500"></div>
                <div class="w-6 h-9 bg-sand/30 dark:bg-white/10 rounded-sm"></div>
                <div class="w-6 h-7 bg-sand/30 dark:bg-white/10 rounded-sm"></div>
              </div>
              <h3 class="text-xl font-serif font-bold mb-3 text-charcoal dark:text-white">Fluid Layouts</h3>
              <p class="text-khaki dark:text-sand/70">Canvases that automatically organize for readability, keeping your mind clear for creativity.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="py-24 px-6 lg:px-20 bg-white dark:bg-[#1e1711]">
        <div class="mx-auto max-w-[1400px]">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-8">
            <div class="flex flex-col gap-6 group cursor-pointer">
              <!-- ... images kept same ... -->
               <div class="overflow-hidden rounded-xl aspect-[4/5] relative">
                <div class="w-full h-full bg-center bg-cover transition-transform duration-700 group-hover:scale-105" data-alt="Abstract visualization of data logic streams in soft cream colors" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCHvcaMNXE_RQ0VTo91N8LoDvPHVVn53yITCzCylVgceNw62erRGtcViEb6cg5aPKQsGlE7EyhzyiZnTwtvSkgBfquZoChmNOVts6ar2rXzjrj2IqvwgrZ_Scw2XGNAshg-OCIjCqA4wt5dxD1ebUDfWSgHae8eSq2n7deOksVPKR_OkjV9jQVcQkNGxI4yZUe9biItBIXbL_PCGh947mN1-FX5jUsbmmRsj8ZvK6uIlTpyAn3rzYLWHG9nqIcLL_W7vjS4Xbhdan8');"></div>
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500"></div>
              </div>
              <div>
                <span class="text-xs font-bold tracking-widest uppercase text-primary mb-2 block">Workflow</span>
                <h3 class="text-2xl font-serif font-medium text-charcoal dark:text-white mb-2 group-hover:text-primary transition-colors">Visual Logic</h3>
                <p class="text-khaki dark:text-sand/70 leading-relaxed">See how your data moves through the system with unparalleled clarity.</p>
              </div>
            </div>
            <div class="flex flex-col gap-6 group cursor-pointer lg:translate-y-16">
               <div class="overflow-hidden rounded-xl aspect-[4/5] relative">
                <div class="w-full h-full bg-center bg-cover transition-transform duration-700 group-hover:scale-105" data-alt="Minimalist desk setup with tablet showing workflow diagrams" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBEtnTBcV4dZiNvNOyfsb2RYvLkEA9_KmhL4VyrrjVMjQqjAOmER7GdWPLXMxLSvDUenlHS3OyZtZ5PWtdEYFWHSZ6Hx8nDW2MiFKK-MKUeRiqR_c_-iBEdzI-1va0kxRictMG84EcYpY3OirY-4BO4gQ8aJ9pKCXDOp3LJxbp_P5RJFDJvtCkBVbAOBPE5sROnYknA9EwYgD626avbVGYalzSrPD4zaGMp5pP9dutDnTdFm6eWHic2ZxYCCVVIx9TVjB60Dks1Mx8');"></div>
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500"></div>
              </div>
              <div>
                <span class="text-xs font-bold tracking-widest uppercase text-primary mb-2 block">Connectivity</span>
                <h3 class="text-2xl font-serif font-medium text-charcoal dark:text-white mb-2 group-hover:text-primary transition-colors">Data Streams</h3>
                <p class="text-khaki dark:text-sand/70 leading-relaxed">Connect sources effortlessly with visual cues that guide your hand.</p>
              </div>
            </div>
            <div class="flex flex-col gap-6 group cursor-pointer">
               <div class="overflow-hidden rounded-xl aspect-[4/5] relative">
                <div class="w-full h-full bg-center bg-cover transition-transform duration-700 group-hover:scale-105" data-alt="Artistic rendering of digital output generation" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuDBr4c9zNlWwNVVBefmsEyooTEQorzqVc2VroBG8yddXffVqS21LDdIftlpkaWpGO1zFVBdXJsu2Tv1IdWKLAB-TLgy0aLfgGj4OD2vZuTWa0WWAlp4MSZ5mZOL9ZubLh85Hzhl79HyoU-0aJIJ1-Y_CvULHJgEnVLbTrJs-tIYbop0YG517qtHfGMlNGzA0nwY7ihlgu4bwW1s3DI-lLkHg0UqrvCZtQeM2gD-1_ORUx8cMcHUj9mac3rO4ww-ued-BWNqmbtr7yU');"></div>
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500"></div>
              </div>
              <div>
                <span class="text-xs font-bold tracking-widest uppercase text-primary mb-2 block">Result</span>
                <h3 class="text-2xl font-serif font-medium text-charcoal dark:text-white mb-2 group-hover:text-primary transition-colors">Output Artistry</h3>
                <p class="text-khaki dark:text-sand/70 leading-relaxed">Generate beautiful reports that look designed by a human hand.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="py-32 px-6 lg:px-20 bg-background-light dark:bg-background-dark relative overflow-hidden">
        <div class="absolute right-0 top-0 w-1/3 h-full bg-sand/10 dark:bg-white/5 -skew-x-12 translate-x-1/2"></div>
        <div class="mx-auto max-w-[960px] text-center relative z-10">
          <h2 class="font-serif text-5xl lg:text-7xl font-medium mb-8 text-charcoal dark:text-white tracking-tight">
            Ready to design <br/>your future?
          </h2>
          <p class="text-lg lg:text-xl text-khaki dark:text-sand/80 mb-12 max-w-2xl mx-auto font-light">
            Join thousands of creators who have switched to a workflow that respects their design sensibilities.
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <router-link to="/app" class="flex min-w-[160px] cursor-pointer items-center justify-center rounded-full h-14 px-8 bg-primary hover:bg-primary/90 text-white text-lg font-bold transition-all shadow-lg hover:shadow-primary/30">
              Get Started
            </router-link>
            <button class="flex min-w-[160px] cursor-pointer items-center justify-center rounded-full h-14 px-8 bg-white border border-sand text-charcoal hover:bg-sand/20 font-medium transition-colors">
              View Pricing
            </button>
          </div>
        </div>
      </section>
    </main>
    <footer id="footer" class="bg-charcoal text-sand py-16 px-6 lg:px-20 border-t border-white/10">
      <div class="mx-auto max-w-[1400px]">
        <div class="flex flex-col md:flex-row justify-between items-start gap-12">
          <div class="flex flex-col gap-6 max-w-sm">
            <div class="flex items-center gap-4 text-white">
              <div class="size-8 text-primary">
                <svg class="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path clip-rule="evenodd" d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z" fill="currentColor" fill-rule="evenodd"></path>
                </svg>
              </div>
              <h2 class="text-xl font-serif font-bold tracking-tight">Aether Flow</h2>
            </div>
            <p class="text-sand/60 font-light">
              A minimal approach to maximum complexity. Designing the future of workflow automation, one node at a time.
            </p>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-12 w-full md:w-auto">
            <div class="flex flex-col gap-4">
              <h4 class="text-white font-bold text-sm uppercase tracking-wider">Product</h4>
              <a class="text-sand/60 hover:text-primary transition-colors" href="#features" @click.prevent="scrollToSection('features')">Features</a>
              <a class="text-sand/60 hover:text-primary transition-colors" href="#">Workflow</a>
              <a class="text-sand/60 hover:text-primary transition-colors" href="#">Pricing</a>
            </div>
            <div class="flex flex-col gap-4">
              <h4 class="text-white font-bold text-sm uppercase tracking-wider">Company</h4>
              <a class="text-sand/60 hover:text-primary transition-colors" href="#stats" @click.prevent="scrollToSection('stats')">About</a>
              <a class="text-sand/60 hover:text-primary transition-colors" href="#manifesto" @click.prevent="scrollToSection('manifesto')">Manifesto</a>
              <a class="text-sand/60 hover:text-primary transition-colors" href="#">Careers</a>
            </div>
            <div class="flex flex-col gap-4">
              <h4 class="text-white font-bold text-sm uppercase tracking-wider">Resources</h4>
              <a class="text-sand/60 hover:text-primary transition-colors" href="#footer" @click.prevent="scrollToSection('footer')">Journal</a>
              <a class="text-sand/60 hover:text-primary transition-colors" href="#">Help Center</a>
              <a class="text-sand/60 hover:text-primary transition-colors" href="#">Community</a>
            </div>
            <div class="flex flex-col gap-4">
              <h4 class="text-white font-bold text-sm uppercase tracking-wider">Social</h4>
              <a class="text-sand/60 hover:text-primary transition-colors" href="#">Twitter</a>
              <a class="text-sand/60 hover:text-primary transition-colors" href="#">Instagram</a>
              <a class="text-sand/60 hover:text-primary transition-colors" href="#">LinkedIn</a>
            </div>
          </div>
        </div>
        <div class="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-sand/40">
          <p>© 2024 Aether Flow Inc. All rights reserved.</p>
          <div class="flex gap-8">
            <a class="hover:text-sand transition-colors" href="#">Privacy Policy</a>
            <a class="hover:text-sand transition-colors" href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const scrollToSection = (id: string, closeMenu = false) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
    if (closeMenu) {
      isMenuOpen.value = false
    }
  }
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
