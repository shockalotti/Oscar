document.addEventListener('DOMContentLoaded', () => {
    const navToggleBtn = document.getElementById('nav-toggle-btn');
    const navCloseBtn = document.getElementById('nav-close-btn');
    const mainNav = document.getElementById('main-nav');
    const body = document.body;

    if (navToggleBtn && mainNav) {
        navToggleBtn.addEventListener('click', () => {
            mainNav.classList.add('active');
            body.classList.add('nav-open'); // Add class to body for potential overlay
        });
    }

    if (navCloseBtn && mainNav) {
        navCloseBtn.addEventListener('click', () => {
            mainNav.classList.remove('active');
            body.classList.remove('nav-open');
        });
    }

    // Optional: Close nav if clicking outside of it
    document.addEventListener('click', (event) => {
        const isClickInsideNav = mainNav.contains(event.target);
        const isClickOnToggle = navToggleBtn.contains(event.target);

        if (!isClickInsideNav && !isClickOnToggle && mainNav.classList.contains('active')) {
            mainNav.classList.remove('active');
            body.classList.remove('nav-open');
        }
    });

     // Optional: Close nav on link click (for single page apps or smooth scroll)
     mainNav.querySelectorAll('a').forEach(link => {
         link.addEventListener('click', () => {
              if (mainNav.classList.contains('active')) {
                   mainNav.classList.remove('active');
                   body.classList.remove('nav-open');
              }
         });
     });
});