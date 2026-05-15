// 1. NAVIGATION TOGGLE
const navToggle = document.getElementById('navToggle');
const navToggleHandle = document.getElementById('navToggleHandle');
const navToggleText = navToggle.querySelector('.nav-toggle-text');
const adminModal = document.getElementById('adminModal');
const subModal = document.getElementById('subModal');
const authTypeInput = document.getElementById('authTypeInput');
const subscriberName = document.getElementById('subscriberName');
const subscriberPassword = document.getElementById('subscriberPassword');
const subscriberSubmit = document.getElementById('subscriberSubmit');

function setNavState(state) {
    navToggle.dataset.state = state;
    if (state === 'admin') {
        navToggleText.textContent = 'Admin Login';
        navToggle.classList.add('admin-active');
    } else {
        navToggleText.textContent = 'Free Subscriber';
        navToggle.classList.remove('admin-active');
    }
}

navToggleHandle.addEventListener('click', (event) => {
    event.stopPropagation();
    const state = navToggle.dataset.state === 'admin' ? 'subscriber' : 'admin';
    setNavState(state);
});

navToggle.addEventListener('click', () => {
    const state = navToggle.dataset.state;
    if (state === 'admin') {
        openAdminModal();
    } else {
        openSubModal();
    }
});

function openAdminModal() {
    adminModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeAdminModal() {
    adminModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function switchSubscriberAuth(type) {
    const tabs = document.querySelectorAll('.auth-tab');
    tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.auth === type));

    authTypeInput.value = type;
    if (type === 'sign-in') {
        document.getElementById('subscriberModalTitle').textContent = 'Free Subscriber Sign In';
        document.getElementById('subscriberModalDescription').textContent = 'Enter your email and password to access project materials.';
        subscriberName.style.display = 'none';
        subscriberPassword.placeholder = 'Password';
        subscriberSubmit.textContent = 'Sign In';
    } else {
        document.getElementById('subscriberModalTitle').textContent = 'Free Subscriber Sign Up';
        document.getElementById('subscriberModalDescription').textContent = 'Create an account with your email, name, and password.';
        subscriberName.style.display = 'block';
        subscriberPassword.placeholder = 'Create Password';
        subscriberSubmit.textContent = 'Sign Up';
    }
}

function openSubModal() {
    switchSubscriberAuth('sign-in');
    subModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeSubModal() {
    subModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

setNavState('subscriber');

// 2. PROJECT MODAL LOGIC
function showDetails(title, desc, stack, github) {
    document.getElementById('m-title').innerText = title;
    document.getElementById('m-stack').innerText = "Tech Stack: " + stack;
    document.getElementById('m-desc').innerText = desc;

    let repoDiv = document.getElementById('m-repo');

    // Display GitHub link or "Not Available"
    if (github && github !== "None" && github !== "" && github !== "null") {
        repoDiv.innerHTML = `
            <a href="${github}" target="_blank" class="repo-btn">
                <span>View Source Code on GitHub</span>
            </a>`;
    } else {
        repoDiv.innerHTML = `
            <div class="apology-box">
                <p><strong>GitHub Link:</strong> Not Available</p>
                <small>This project's source code is not publicly available.</small>
            </div>`;
    }
    
    document.getElementById('projectModal').style.display = "flex";
    document.body.style.overflow = "hidden";
}

function closeModal() {
    document.getElementById('projectModal').style.display = "none";
    document.body.style.overflow = "auto";
}

function handleProjectClick(cardEl, title, desc, stack, github, isSubscriber) {
    if (isSubscriber === true || isSubscriber === 'true') {
        showDetails(title, desc, stack, github);
        return;
    }

    if (cardEl) {
        triggerLockedCardFeedback(cardEl);
    }
    openSubModal();
}

function triggerLockedCardFeedback(cardEl) {
    if (navigator.vibrate) {
        navigator.vibrate([20, 30, 20]);
    }

    const overlayText = cardEl.querySelector('.card-overlay span');
    if (overlayText) {
        overlayText.textContent = 'Subscribe free to view';
    }

    cardEl.classList.add('locked-shake', 'show-message');

    if (cardEl._lockedMessageTimer) {
        clearTimeout(cardEl._lockedMessageTimer);
    }

    cardEl._lockedMessageTimer = setTimeout(() => {
        cardEl.classList.remove('locked-shake', 'show-message');
        cardEl._lockedMessageTimer = null;
    }, 10000);
}

// 3. SUBSCRIBER MODAL LOGIC
function openSubModal() {
    document.getElementById('subModal').style.display = "flex";
    document.body.style.overflow = "hidden";
}

function closeSubModal() {
    document.getElementById('subModal').style.display = "none";
    document.body.style.overflow = "auto";
}

function switchProjectSlide(projectId, imgUrl) {
    const mainImage = document.getElementById(`projectMainImage-${projectId}`);
    if (!mainImage) return;
    mainImage.src = imgUrl;
    const thumbs = mainImage.parentElement.querySelectorAll('.project-thumb');
    thumbs.forEach(thumb => {
        thumb.classList.toggle('active', thumb.dataset.img === imgUrl);
    });
}

// PROFILE CRYSTAL ANIMATION
function initializeCrystalAnimation() {
    const crystalGrid = document.getElementById('crystalGrid');
    if (!crystalGrid) return;

    const gridSize = 40;
    const gridCount = Math.ceil(280 / gridSize);
    const crystals = [];

    for (let i = 0; i < gridCount * gridCount; i++) {
        crystals.push(i);
    }

    crystals.sort(() => Math.random() - 0.5);

    crystals.forEach((i, index) => {
        const crystal = document.createElement('div');
        crystal.className = 'crystal';

        const row = Math.floor(i / gridCount);
        const col = i % gridCount;
        const x = col * gridSize;
        const y = row * gridSize;

        const centerX = 140;
        const centerY = 140;
        const offsetX = x - centerX;
        const offsetY = y - centerY;
        const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
        const angle = Math.atan2(offsetY, offsetX);

        const startX = Math.cos(angle) * (distance + 60);
        const startY = Math.sin(angle) * (distance + 60);

        crystal.style.left = x + 'px';
        crystal.style.top = y + 'px';
        crystal.style.width = gridSize - 2 + 'px';
        crystal.style.height = gridSize - 2 + 'px';
        crystal.style.setProperty('--tx', startX + 'px');
        crystal.style.setProperty('--ty', startY + 'px');
        crystal.style.animationDelay = (index * 0.02) + 's';

        crystalGrid.appendChild(crystal);
    });

    setTimeout(() => {
        const welcomeMsg = document.getElementById('welcomeMessage');
        if (welcomeMsg) {
            welcomeMsg.style.display = 'block';
            welcomeMsg.style.opacity = '1';
        }
        const h1 = document.querySelector('.reveal-text');
        if (h1) {
            h1.style.opacity = '1';
        }
    }, 2600);
}

// PROJECT IMAGE NAVIGATION
let projectImages = {};

function setupProjectImages() {
    document.querySelectorAll('.image-carousel').forEach(carousel => {
        const projectId = carousel.getAttribute('data-project-id');
        const imageCount = parseInt(carousel.getAttribute('data-image-count')) || 1;
        projectImages[projectId] = { current: 0, count: imageCount };
    });
}

function prevProjectSlide(projectId) {
    if (!projectImages[projectId]) return;
    const project = projectImages[projectId];
    project.current = (project.current - 1 + project.count) % project.count;
    updateProjectImage(projectId);
}

function nextProjectSlide(projectId) {
    if (!projectImages[projectId]) return;
    const project = projectImages[projectId];
    project.current = (project.current + 1) % project.count;
    updateProjectImage(projectId);
}

function updateProjectImage(projectId) {
    const carousel = document.querySelector(`[data-project-id="${projectId}"]`);
    if (!carousel) return;

    const images = carousel.parentElement.querySelectorAll('.project-carousel-image');
    const thumbs = carousel.parentElement.querySelectorAll('.project-thumb');
    const mainImage = document.getElementById(`projectMainImage-${projectId}`);

    if (mainImage && thumbs.length > 0) {
        const currentThumb = thumbs[projectImages[projectId].current];
        if (currentThumb && currentThumb.dataset.img) {
            mainImage.src = currentThumb.dataset.img;
            thumbs.forEach((thumb, idx) => {
                thumb.classList.toggle('active', idx === projectImages[projectId].current);
            });
        }
    }
}

// 4. SCROLL REVEAL ANIMATION (Intersection Observer)
// This makes sections fade and slide up as you scroll to them
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);

document.querySelectorAll('.scroll-section').forEach(section => {
    observer.observe(section);
});

// 5. CLOSE MODALS ON OUTSIDE CLICK
window.onclick = function(event) {
    const projectModal = document.getElementById('projectModal');
    const subModal = document.getElementById('subModal');
    const adminModal = document.getElementById('adminModal');
    if (event.target == projectModal) {
        closeModal();
    }
    if (event.target == subModal) {
        closeSubModal();
    }
    if (event.target == adminModal) {
        closeAdminModal();
    }
}

// INITIALIZE ON PAGE LOAD
document.addEventListener('DOMContentLoaded', () => {
    initializeCrystalAnimation();
    setupProjectImages();
});