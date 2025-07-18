/*
  Name: Muhammad Alamin Islam (Sagor)
  GitHub: https://github.com/SagorIslamOfficial
  Website: https://sagorislam.dev
  LinkedIn: https://www.linkedin.com/in/sagorislamofficial/
  Company: ThemeXpert
  Available: Open to work, projects, and collaborations worldwide
  Contact: alaminislam1274@gmail.com | sagor_islam@icloud.com

  About me:
  Full-Stack Web Developer with expertise in Laravel, WordPress, and modern web technologies. Passionate about building scalable solutions, learning new technologies, and contributing to open source. Based in Dhaka, Bangladesh, and always eager to collaborate on innovative projects.
*/
// content-form-detect.js
// Detects if a form input is focused or dirty and sets a flag in chrome.storage.local

function setFormActiveFlag(active) {
  chrome.runtime.sendMessage({ type: 'setFormActive', active });
}

let formActive = false;

function checkFormActivity() {
  const activeElement = document.activeElement;
  if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable)) {
    if (!formActive) {
      formActive = true;
      setFormActiveFlag(true);
    }
    return;
  }
  // Check for dirty forms (simple check: any input/textarea with value)
  const dirty = Array.from(document.querySelectorAll('input,textarea')).some(el => el.value && el.value.length > 0);
  if (dirty && !formActive) {
    formActive = true;
    setFormActiveFlag(true);
  } else if (!dirty && formActive) {
    formActive = false;
    setFormActiveFlag(false);
  }
}

document.addEventListener('focusin', checkFormActivity, true);
document.addEventListener('input', checkFormActivity, true);
document.addEventListener('focusout', checkFormActivity, true);
window.addEventListener('beforeunload', () => setFormActiveFlag(false));

// Initial check
checkFormActivity(); 