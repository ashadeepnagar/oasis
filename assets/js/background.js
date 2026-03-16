// 1. Hero background rotation (every 10 seconds)
    // ──────────────────────────────────────────────
    const heroSection = document.getElementById('home');
    const backgrounds = [
      'url("/assets/images/bg/bg.jpg")',
      'url("/assets/images/bg/bg2.jpg")',
      'url("/assets/images/bg/bg3.jpg")',
      'url("/assets/images/bg/bg4.jpg")',
      'url("/assets/images/bg/bg5.jpg")',
      'url("/assets/images/bg/bg6.jpg")',
      'url("/assets/images/bg/bg8.jpg")',
    //  'url("/assets/images/bg9.jpg")',
    //  'url("/assets/images/bg10.jpg")',
    //  'url("/assets/images/bg11.jpg")'
    ].filter(Boolean); // remove empty if you have fewer /assets/images/s

    let currentBgIndex = 0;

    function changeBackground() {
      if (backgrounds.length > 0) {
        heroSection.style.backgroundImage = backgrounds[currentBgIndex];
        currentBgIndex = (currentBgIndex + 1) % backgrounds.length;
      }
    }

    if (backgrounds.length > 1) {
      changeBackground(); // initial
      setInterval(changeBackground, 10000);
    }