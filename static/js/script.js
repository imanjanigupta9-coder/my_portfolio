// 1. THEME TOGGLE (With LocalStorage memory)
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Check for saved theme preference on load
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-theme');
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-theme');
    // Save preference
    if (body.classList.contains('dark-theme')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});

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

// 5. ADMIN BUTTON APPEARS AFTER SCROLL
const adminButton = document.getElementById('admin-scroll-btn');
window.addEventListener('scroll', () => {
    if (!adminButton) return;
    if (window.scrollY > 420) {
        adminButton.classList.add('show');
    } else {
        adminButton.classList.remove('show');
    }
});

// 6. CLOSE MODALS ON OUTSIDE CLICK
window.onclick = function(event) {
    const projectModal = document.getElementById('projectModal');
    const subModal = document.getElementById('subModal');
    if (event.target == projectModal) {
        closeModal();
    }
    if (event.target == subModal) {
        closeSubModal();
    }
}