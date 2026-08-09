/**
 * ============================================================
 * WALKWITHJOHIR — Main JavaScript
 * ============================================================
 */

'use strict';

/* ============================================================
   GLOBAL STATE
============================================================ */
const App = {
    projects: [],
    filteredProjects: [],
    currentFilter: "all",
    currentProject: null,
    currentPhoto: 0
};

/* ============================================================
   START APPLICATION
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    initialize();
});

function initialize() {
    if (typeof PHOTO_DATA !== "undefined") {
        App.projects = Object.values(PHOTO_DATA);
        App.filteredProjects = [...App.projects];
    }
    
    initNavigation();
    initSmoothScroll();
    initHero();
    renderProjects();
    initGlobalKeyboardListeners();
    openPhotoFromHash();
}

/* ============================================================
   UTILITIES
============================================================ */
function $(selector) {
    return document.querySelector(selector);
}

function $$(selector) {
    return document.querySelectorAll(selector);
}

/* ============================================================
   NAVIGATION
============================================================ */
function initNavigation() {
    const menuBtn = $("#menuBtn");
    const overlay = $("#mobileOverlay");
    if (!menuBtn || !overlay) return;

    menuBtn.addEventListener("click", () => {
        overlay.classList.toggle("active");
        menuBtn.classList.toggle("active");
    });

    overlay.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            overlay.classList.remove("active");
            menuBtn.classList.remove("active");
        });
    });

    window.addEventListener("scroll", () => {
        const nav = $("#nav");
        if (!nav) return;
        if (window.scrollY > 40) {
            nav.classList.add("nav-scrolled");
        } else {
            nav.classList.remove("nav-scrolled");
        }
    });
}

/* ============================================================
   SMOOTH SCROLL
============================================================ */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute("href"));
            if (!target) return;
            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });
}

/* ============================================================
   HERO PARALLAX
============================================================ */
function initHero() {
    const heroImage = $(".hero-image");
    if (!heroImage) return;
    window.addEventListener("scroll", () => {
        const y = window.scrollY;
        heroImage.style.transform = `scale(1.05) translateY(${y * 0.20}px)`;
    });
}

/* ============================================================
   PROJECT RENDERING
============================================================ */
function renderProjects() {
    const grid = $("#projectsGrid");
    if (!grid) return;
    grid.innerHTML = "";

    App.filteredProjects.forEach(project => {
        const card = createProjectCard(project);
        grid.appendChild(card);
    });
}

function createProjectCard(project) {
    const article = document.createElement("article");
    article.className = "project-card";

    article.innerHTML = `
        <div class="project-image">
            <img src="photos/${project.folder}/${project.cover}" alt="${project.title}" loading="lazy">
        </div>
        <div class="project-content">
            <div class="project-meta">
                <span>${project.category}</span>
                <span>${project.year}</span>
            </div>
            <h2 class="project-title">${project.title}</h2>
            <p class="project-description">${project.description.substring(0, 220)}...</p>
            <div class="project-footer">
                <span>${project.photos.length} Photographs</span>
                <button class="project-button">Open Project →</button>
            </div>
        </div>
    `;

    article.querySelector(".project-button").addEventListener("click", () => {
        openProject(project);
    });

    return article;
}

/* ============================================================
   PROJECT VIEWER
============================================================ */
function createProjectViewer() {
    if ($("#projectViewer")) return;

    const viewer = document.createElement("div");
    viewer.id = "projectViewer";
    viewer.className = "project-viewer";

    viewer.innerHTML = `
        <div class="viewer-backdrop"></div>
        <div class="viewer-window">
            <button class="viewer-close" id="viewerClose">×</button>
            <div class="viewer-content" id="viewerContent"></div>
        </div>
    `;
    document.body.appendChild(viewer);

    $("#viewerClose").addEventListener("click", closeProject);
    viewer.querySelector(".viewer-backdrop").addEventListener("click", closeProject);
}

function openProject(project) {
    App.currentProject = project;
    createProjectViewer();

    const content = $("#viewerContent");
    content.innerHTML = "";

    /* ---------- Header ---------- */
    const header = document.createElement("div");
    header.className = "viewer-header";
    header.innerHTML = `
        <p class="viewer-category">${project.category}</p>
        <h1 class="viewer-title">${project.title}</h1>
        <div class="viewer-meta">
            <span>${project.year}</span>
            <span>${project.location}</span>
            <span>${project.status}</span>
        </div>
        <div class="viewer-description">${project.description}</div>
    `;
    content.appendChild(header);

    /* ---------- Gallery ---------- */
    const gallery = document.createElement("div");
    gallery.className = "viewer-gallery";

    project.photos.forEach((photo, index) => {
        const item = document.createElement("div");
        item.className = "viewer-photo";
        item.innerHTML = `
            <img src="photos/${project.folder}/${photo}" alt="${project.title} ${index + 1}" loading="lazy">
        `;
        item.addEventListener("click", () => openLightbox(index));
        gallery.appendChild(item);
    });

    content.appendChild(gallery);
    $("#projectViewer").classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeProject() {
    const viewer = $("#projectViewer");
    if (!viewer) return;
    viewer.classList.remove("active");
    document.body.style.overflow = "";
}

/* ============================================================
   LIGHTBOX
============================================================ */
function createLightbox() {
    if ($("#lightbox")) return;

    const lightbox = document.createElement("div");
    lightbox.id = "lightbox";
    lightbox.className = "lightbox";
    lightbox.innerHTML = `
        <div class="lightbox-backdrop"></div>
        <div class="lightbox-container">
            <button class="lightbox-close">×</button>
            <button class="lightbox-prev">&#10094;</button>
            <button class="lightbox-next">&#10095;</button>
            <img class="lightbox-image" src="" alt="">
            <div class="lightbox-info">
                <h3 id="lightboxTitle"></h3>
                <p id="lightboxCounter"></p>
                <button class="lightbox-share" id="lightboxShare">↗ Share</button>
            </div>
        </div>
    `;
    document.body.appendChild(lightbox);

    $(".lightbox-close").addEventListener("click", closeLightbox);
    $(".lightbox-backdrop").addEventListener("click", closeLightbox);
    $(".lightbox-prev").addEventListener("click", previousPhoto);
    $(".lightbox-next").addEventListener("click", nextPhoto);
    $("#lightboxShare").addEventListener("click", shareCurrentPhoto);
}

function openLightbox(index) {
    createLightbox();
    App.currentPhoto = index;
    updateLightbox();
    updatePhotoUrl();
    $("#lightbox").classList.add("active");
}

function updatePhotoUrl() {
    const project = App.currentProject;
    if (!project) return;

    const photoNumber = App.currentPhoto + 1;
    history.replaceState(
        null,
        "",
        `#${project.folder}/${photoNumber}`
    );
}

async function shareCurrentPhoto() {
    const project = App.currentProject;
    if (!project) return;

    const photoNumber = App.currentPhoto + 1;
    const shareUrl = `${window.location.origin}/#${project.folder}/${photoNumber}`;

    if (navigator.share) {
        try {
            await navigator.share({
                title: `${project.title} — Photo ${photoNumber}`,
                text: `A photograph from ${project.title} by Walk with Johir.`,
                url: shareUrl
            });
        } catch (error) {
            if (error.name !== "AbortError") {
                console.error("Share failed:", error);
            }
        }
    } else {
        try {
            await navigator.clipboard.writeText(shareUrl);
            alert("Photo link copied to clipboard.");
        } catch (error) {
            console.error("Could not copy link:", error);
            alert("Could not copy the photo link.");
        }
    }
}

function openPhotoFromHash() {
    const hash = window.location.hash.substring(1);

    if (!hash) return;

    const parts = hash.split("/");
    if (parts.length !== 2) return;

    const folder = parts[0];
    const photoNumber = parseInt(parts[1], 10);

    if (!folder || !photoNumber || photoNumber < 1) return;

    const project = App.projects.find(
        project => project.folder === folder
    );

    if (!project) return;

    const photoIndex = photoNumber - 1;

    if (photoIndex < 0 || photoIndex >= project.photos.length) return;

    openProject(project);

    setTimeout(() => {
        openLightbox(photoIndex);
    }, 100);
}



function updateLightbox() {
    const project = App.currentProject;
    if (!project) return;

    const photo = project.photos[App.currentPhoto];
    const img = $(".lightbox-image");
    
    img.src = `photos/${project.folder}/${photo}`;
    img.alt = project.title;
    $("#lightboxTitle").textContent = project.title;
    $("#lightboxCounter").textContent = `${App.currentPhoto + 1} / ${project.photos.length}`;

    preloadNextImage();
}

function nextPhoto() {
    const total = App.currentProject.photos.length;
    App.currentPhoto = (App.currentPhoto + 1) % total;
    updateLightbox();
}

function previousPhoto() {
    const total = App.currentProject.photos.length;
    App.currentPhoto = (App.currentPhoto - 1 + total) % total;
    updateLightbox();
}

function closeLightbox() {
    const lightbox = $("#lightbox");
    if (lightbox) {
        lightbox.classList.remove("active");
    }
}

function preloadNextImage() {
    const project = App.currentProject;
    if (!project) return;
    
    const next = (App.currentPhoto + 1) % project.photos.length;
    const img = new Image();
    img.src = `photos/${project.folder}/${project.photos[next]}`;
}

/* ============================================================
   CONSOLIDATED KEYBOARD NAVIGATION
============================================================ */
function initGlobalKeyboardListeners() {
    document.addEventListener("keydown", e => {
        const lightbox = $("#lightbox");
        const isLightboxActive = lightbox && lightbox.classList.contains("active");

        if (isLightboxActive) {
            switch (e.key) {
                case "ArrowRight":
                    nextPhoto();
                    break;
                case "ArrowLeft":
                    previousPhoto();
                    break;
                case "Escape":
                    closeLightbox();
                    break;
            }
            return; // Don't proceed to closing the project viewer if lightbox was active
        }

        const projectViewer = $("#projectViewer");
        const isViewerActive = projectViewer && projectViewer.classList.contains("active");

        if (isViewerActive && e.key === "Escape") {
            closeProject();
        }
    });
}