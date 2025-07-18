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
// Created by [Your Name or Organization]
// suspended.js
// Handles restoring the original tab URL

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const originalUrl = urlParams.get('url');
  const urlDisplay = document.getElementById('original-url');
  const restoreBtn = document.getElementById('restore-btn');

  if (originalUrl) {
    urlDisplay.textContent = `Original URL: ${originalUrl}`;
    restoreBtn.disabled = false;
  } else {
    urlDisplay.textContent = 'Original URL not found.';
    restoreBtn.disabled = true;
  }

  restoreBtn.addEventListener('click', () => {
    if (originalUrl) {
      window.location.href = originalUrl;
    }
  });
}); 