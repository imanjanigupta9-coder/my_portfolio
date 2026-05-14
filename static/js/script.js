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
    body.style.overflow = "hidden";
}

function closeModal() {
    document.getElementById('projectModal').style.display = "none";
    body.style.overflow = "auto";
}

// 3. SUBSCRIBER MODAL LOGIC
function openSubModal() {
    document.getElementById('subModal').style.display = "flex";
    body.style.overflow = "hidden";
}

function closeSubModal() {
    document.getElementById('subModal').style.display = "none";
    body.style.overflow = "auto";
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