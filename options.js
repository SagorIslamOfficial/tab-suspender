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
// options.js
// Handles options page logic for Tab Suspender extension

// Whitelist management logic
const whitelistList = document.getElementById('whitelist-list');
const whitelistSection = document.getElementById('whitelist-section');

// Create add form
const addForm = document.createElement('form');
addForm.id = 'whitelist-add-form';
addForm.innerHTML = `
  <input type="text" id="whitelist-input" placeholder="Add domain or pattern" required style="width: 220px;">
  <button type="submit">Add</button>
`;
whitelistSection.appendChild(addForm);

// Feedback message element
let feedbackMsg = document.createElement('div');
feedbackMsg.className = 'feedback';
whitelistSection.appendChild(feedbackMsg);

function showFeedback(msg) {
  feedbackMsg.textContent = msg;
  feedbackMsg.style.opacity = 1;
  setTimeout(() => {
    feedbackMsg.style.opacity = 0;
    feedbackMsg.textContent = '';
  }, 1200);
}

function renderWhitelist(list) {
  whitelistList.innerHTML = '';
  if (!list.length) {
    whitelistList.innerHTML = '<li><em>No entries yet.</em></li>';
    return;
  }
  list.forEach((pattern, idx) => {
    const li = document.createElement('li');
    li.textContent = pattern + ' ';
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Remove';
    delBtn.style.marginLeft = '8px';
    delBtn.onclick = () => removeWhitelistEntry(idx);
    li.appendChild(delBtn);
    whitelistList.appendChild(li);
  });
}

function loadWhitelist() {
  chrome.storage.local.get(['whitelist'], result => {
    renderWhitelist(result.whitelist || []);
  });
}

function addWhitelistEntry(pattern) {
  chrome.storage.local.get(['whitelist'], result => {
    const list = result.whitelist || [];
    if (!list.includes(pattern)) {
      list.push(pattern);
      chrome.storage.local.set({ whitelist: list }, () => {
        loadWhitelist();
        showFeedback('Added!');
      });
    }
  });
}

function removeWhitelistEntry(idx) {
  chrome.storage.local.get(['whitelist'], result => {
    const list = result.whitelist || [];
    list.splice(idx, 1);
    chrome.storage.local.set({ whitelist: list }, () => {
      loadWhitelist();
      showFeedback('Removed!');
    });
  });
}

addForm.addEventListener('submit', e => {
  e.preventDefault();
  const input = document.getElementById('whitelist-input');
  const value = input.value.trim();
  if (value) {
    addWhitelistEntry(value);
    input.value = '';
  }
});

// Per-domain timers management
const perDomainTimersList = document.getElementById('per-domain-timers-list');
const perDomainTimersAddForm = document.getElementById('per-domain-timers-add-form');
const perDomainDomainInput = document.getElementById('per-domain-domain-input');
const perDomainMinutesInput = document.getElementById('per-domain-minutes-input');

function renderPerDomainTimers(map) {
  perDomainTimersList.innerHTML = '';
  const entries = Object.entries(map || {});
  if (!entries.length) {
    perDomainTimersList.innerHTML = '<li><em>No custom timers set.</em></li>';
    return;
  }
  entries.forEach(([domain, minutes]) => {
    const li = document.createElement('li');
    li.textContent = `${domain}: ${minutes} min`;
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Remove';
    delBtn.style.marginLeft = '8px';
    delBtn.onclick = () => removePerDomainTimer(domain);
    li.appendChild(delBtn);
    perDomainTimersList.appendChild(li);
  });
}

function loadPerDomainTimers() {
  chrome.storage.local.get(['perDomainTimers'], result => {
    renderPerDomainTimers(result.perDomainTimers || {});
  });
}

function addPerDomainTimer(domain, minutes) {
  chrome.storage.local.get(['perDomainTimers'], result => {
    const map = result.perDomainTimers || {};
    map[domain] = minutes;
    chrome.storage.local.set({ perDomainTimers: map }, loadPerDomainTimers);
  });
}

function removePerDomainTimer(domain) {
  chrome.storage.local.get(['perDomainTimers'], result => {
    const map = result.perDomainTimers || {};
    delete map[domain];
    chrome.storage.local.set({ perDomainTimers: map }, loadPerDomainTimers);
  });
}

perDomainTimersAddForm.addEventListener('submit', e => {
  e.preventDefault();
  const domain = perDomainDomainInput.value.trim();
  const minutes = parseInt(perDomainMinutesInput.value, 10);
  if (domain && minutes > 0) {
    addPerDomainTimer(domain, minutes);
    perDomainDomainInput.value = '';
    perDomainMinutesInput.value = '';
  }
});

// Initial load
loadWhitelist();
loadPerDomainTimers(); 