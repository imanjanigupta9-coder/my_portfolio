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
    
    // The "Sorry" Logic with Apology Sign
    if (github && github !== "None" && github !== "" && github !== "null") {
        repoDiv.innerHTML = `
            <a href="${github}" target="_blank" class="repo-btn">
                <span>View Source Code on GitHub</span>
            </a>`;
    } else {
        repoDiv.innerHTML = `
            <div class="apology-box">
                <p>⚠️ <strong>Sorry!</strong> No public repository available for this project yet. 🙏</p>
                <small>It might be a private client project or currently under heavy development.</small>
            </div>`;
    }
    
    document.getElementById('projectModal').style.display = "flex"; // Use flex for centering
    body.style.overflow = "hidden"; // Prevent background scroll
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
    if (event.target == projectModal) {
        closeModal();
    }
    if (event.target == subModal) {
        closeSubModal();
    }
}