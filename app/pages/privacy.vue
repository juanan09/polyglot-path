<script setup lang="ts">

useHead({
  title: 'Polyglot Path | Privacy Policy',
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Outfit:wght@300;400;600;700&display=swap' }
  ]
})
</script>

<template>
  <div class="retro-page min-h-screen">
    <!-- CRT Scanlines overlay -->
    <div class="scanlines" aria-hidden="true" />
    
    <!-- Navigation -->
    <div class="p-6">
      <NuxtLink to="/" class="auth-action-btn" style="text-decoration: none;">
        ◀ BACK TO HUB
      </NuxtLink>
    </div>

    <main class="max-w-4xl mx-auto p-8 mt-10 mb-20" style="background: var(--glass-bg); backdrop-filter: blur(12px); border: 1px solid var(--glass-border); border-radius: 1rem; box-shadow: var(--glass-shadow);">
      <h1 class="text-3xl text-gold font-bold mb-8 uppercase" style="font-family: 'Press Start 2P', monospace; font-size: 1.25rem; text-shadow: 2px 2px 0px rgba(0,0,0,0.5); line-height: 1.6;">
        Privacy Policy & Data Processing
      </h1>
      
      <div class="text-secondary leading-relaxed space-y-6 flex flex-col gap-4 text-lg">
        <p>
          <strong>Polyglot Path</strong> is an open-source educational role-playing game designed for language learning. As we prepare this version for public access (v1.0.0), we are committed to keeping your data secure and honoring your privacy according to the principles of "Privacy by Design".
        </p>

        <h2 class="text-xl text-white font-bold mt-4">1. Information We Collect</h2>
        <p>If you choose to register an account to save your progress permanently, we collect:</p>
        <ul class="list-disc pl-6 text-white flex flex-col gap-2" style="opacity: 0.9;">
          <li><strong>Email Address:</strong> Used solely to identify your account and load your save files.</li>
          <li><strong>Player Profile Name:</strong> Your in-game alias.</li>
          <li><strong>Gameplay Telemetry:</strong> Anonymized grammar scores, vocabulary discovered, and dialogue logs. This educational data is stored so you can view your progress in the Learning Codex.</li>
        </ul>

        <h2 class="text-xl text-white font-bold mt-4">2. How We Protect Your Data</h2>
        <p>
          We employ industry-standard security measures to ensure your information remains strictly confidential:
        </p>
        <ul class="list-disc pl-6 text-white flex flex-col gap-2" style="opacity: 0.9;">
          <li><strong>Password Hashing:</strong> Your password is never stored in plain text. We use <code>bcrypt</code> hashing, meaning no one (not even the server administrators) can read your password.</li>
          <li><strong>Rate Limiting:</strong> Authentication endpoints are protected against brute-force attacks to keep your account safe.</li>
          <li><strong>Secure Sessions:</strong> We use httpOnly, encrypted, and secure cookies to maintain your login session.</li>
        </ul>

        <h2 class="text-xl text-white font-bold mt-4">3. Data Sharing & Third Parties</h2>
        <p>
          Your personal data (email, password hash) is <strong>never</strong> sold, rented, or shared with third parties. 
          As the game relies on Artificial Intelligence to generate dialogues, your text inputs are processed by backend AI providers (such as Google Gemini). However, to protect you, your text inputs are heavily sanitized before scanning, and these external requests are <strong>not linked to your personal identity</strong>.
        </p>

        <h2 class="text-xl text-white font-bold mt-4">4. Your Rights</h2>
        <p>
          At any point you can request the deletion of your account and all associated telemetry data. Since this is an open-source, non-commercial instance, please contact the administrator via the project's repository.
        </p>
        
        <p class="mt-8 italic text-sm opacity-70">
          Last updated: April 2026. This game is provided for educational and research purposes.
        </p>
      </div>
    </main>
  </div>
</template>
