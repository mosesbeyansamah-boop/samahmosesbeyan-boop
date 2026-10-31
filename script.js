/* =====================================================================
   MOSES SAMAH - PORTFOLIO JAVASCRIPT
   Profile photo upload, dark/light theme, mobile menu, typing effect,
   scroll animations, skill bars, active menu link, progress bar,
   back-to-top button and contact-form validation.
   ===================================================================== */

(function () {
    "use strict";

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

    document.documentElement.classList.add("js");

    /* ---------- Safe localStorage (never crashes if blocked) ---------- */
    const store = {
        get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
        set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
        del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
    };

    /* =================================================================
       1. PROFILE PHOTO UPLOAD
       Click "Upload photo", choose a picture. It is shrunk to 600px,
       shown at once and saved in this browser.
       ================================================================= */
    const PHOTO_KEY = "moses-profile-photo";
    const MAX_FILE_MB = 8;
    const MAX_SIZE_PX = 600;

    const img = $("#profileImg");
    const fallback = $("#avatarDefault");
    const input = $("#photoInput");
    const uploadBtn = $("#uploadBtn");
    const uploadLabel = $("#uploadLabel");
    const removeBtn = $("#removeBtn");
    const msg = $("#photoMsg");

    function say(text, type) {
        msg.textContent = text;
        msg.className = "photo-msg" + (type ? " " + type : "");
    }

    // OPTIONAL: to show a fixed photo to every visitor, put your picture in this folder
    // (for example profile.jpg) and write its name here: const DEFAULT_PHOTO = "profile.jpg";
    const DEFAULT_PHOTO = "";

    function showPhoto(src) {
        const shown = src || DEFAULT_PHOTO;
        if (shown) {
            img.src = shown;
            img.hidden = false;
            fallback.hidden = true;
        } else {
            img.removeAttribute("src");
            img.hidden = true;
            fallback.hidden = false;
        }
        removeBtn.hidden = !src;
        uploadLabel.textContent = src ? "Change photo" : "Upload photo";
    }

    // Shrink the picture so it is light and fits in browser storage
    function shrink(file) {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);
            const pic = new Image();
            pic.onload = () => {
                const scale = Math.min(1, MAX_SIZE_PX / Math.max(pic.width, pic.height));
                const w = Math.round(pic.width * scale);
                const h = Math.round(pic.height * scale);
                const canvas = document.createElement("canvas");
                canvas.width = w;
                canvas.height = h;
                canvas.getContext("2d").drawImage(pic, 0, 0, w, h);
                URL.revokeObjectURL(url);
                resolve(canvas.toDataURL("image/jpeg", 0.85));
            };
            pic.onerror = () => { URL.revokeObjectURL(url); reject(new Error("bad image")); };
            pic.src = url;
        });
    }

    uploadBtn.addEventListener("click", () => input.click());

    input.addEventListener("change", async () => {
        const file = input.files && input.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            say("Please choose an image file (JPG, PNG, WEBP or GIF).", "error");
        } else if (file.size > MAX_FILE_MB * 1024 * 1024) {
            say("That image is too large. Please choose one under " + MAX_FILE_MB + " MB.", "error");
        } else {
            try {
                const data = await shrink(file);
                showPhoto(data);
                const saved = store.set(PHOTO_KEY, data);
                say(saved ? "Photo updated and saved in this browser." : "Photo shown, but it could not be saved for next time.", saved ? "ok" : "error");
            } catch (e) {
                say("Sorry, that image could not be read. Try another one.", "error");
            }
        }
        input.value = "";   // lets you pick the same file again later
    });

    removeBtn.addEventListener("click", () => {
        store.del(PHOTO_KEY);
        showPhoto(null);
        say("Photo removed.", "");
    });

    showPhoto(store.get(PHOTO_KEY));

    /* =================================================================
       2. THEME (dark / light)
       ================================================================= */
    const themeBtn = $("#themeToggle");
    function applyTheme(t) {
        document.documentElement.setAttribute("data-theme", t);
        themeBtn.textContent = t === "light" ? "☀" : "☾";
        themeBtn.setAttribute("aria-label", t === "light" ? "Switch to dark theme" : "Switch to light theme");
        const meta = $('meta[name="theme-color"]');
        if (meta) meta.setAttribute("content", t === "light" ? "#f5f7fc" : "#0b1020");
    }
    const savedTheme = store.get("moses-theme");
    applyTheme(savedTheme || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));
    themeBtn.addEventListener("click", () => {
        const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
        applyTheme(next);
        store.set("moses-theme", next);
    });

    /* =================================================================
       3. MOBILE MENU
       ================================================================= */
    const nav = $("#nav");
    const menuBtn = $("#menuToggle");
    function setMenu(open) {
        nav.classList.toggle("open", open);
        menuBtn.setAttribute("aria-expanded", String(open));
        menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        menuBtn.textContent = open ? "✕" : "☰";
    }
    menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
    $$("a", nav).forEach(a => a.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

    /* =================================================================
       4. TYPING EFFECT
       ================================================================= */
    const typing = $("#typing");
    const words = ["Computer Science Student", "Aspiring Software Developer", "IT & Networking Enthusiast", "Lifelong Learner"];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
        typing.textContent = words[0];
    } else {
        let w = 0, c = 0, deleting = false;
        (function tick() {
            const word = words[w];
            typing.textContent = word.slice(0, c);
            let delay = deleting ? 40 : 85;
            if (!deleting && c === word.length) { deleting = true; delay = 1500; }
            else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; delay = 350; }
            else { c += deleting ? -1 : 1; }
            setTimeout(tick, delay);
        })();
    }

    /* =================================================================
       5. SCROLL REVEAL AND SKILL BARS
       ================================================================= */
    const showAll = () => { $$(".reveal").forEach(el => el.classList.add("show")); $(".skills-section").classList.add("in"); };
    if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver(entries => {
            entries.forEach(en => {
                if (en.isIntersecting) { en.target.classList.add("show"); io.unobserve(en.target); }
            });
        }, { threshold: 0.12 });
        $$(".reveal").forEach((el, i) => { el.style.transitionDelay = (i % 3) * 0.08 + "s"; io.observe(el); });

        const skillIO = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) { $(".skills-section").classList.add("in"); skillIO.disconnect(); }
        }, { threshold: 0.25 });
        skillIO.observe($(".skills-section"));
    } else {
        showAll();
    }

    /* =================================================================
       6. SCROLL EFFECTS: progress bar, active link, back-to-top
       ================================================================= */
    const progress = $("#progress");
    const toTop = $("#toTop");
    const sections = $$("main section[id]");
    const links = $$("#nav a");

    function onScroll() {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
        toTop.hidden = window.scrollY < 600;

        let current = sections[0].id;
        sections.forEach(s => { if (window.scrollY + 140 >= s.offsetTop) current = s.id; });
        links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + current));
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));

    /* =================================================================
       7. CONTACT FORM
       A web page cannot send email by itself. This form checks the fields,
       then opens the visitor's email app with the message ready, addressed
       to you. To receive messages directly, connect Formspree or Web3Forms.
       ================================================================= */
    const MY_EMAIL = "mosesbeyansamah@gmail.com";
    const form = $("#contactForm");
    const formMsg = $("#formMessage");

    function setFormMsg(text, type) {
        formMsg.textContent = text;
        formMsg.className = type || "";
    }

    form.addEventListener("submit", e => {
        e.preventDefault();
        const f = { name: $("#name"), email: $("#email"), subject: $("#subject"), message: $("#message") };
        const bad = [];

        Object.values(f).forEach(el => el.classList.remove("invalid"));
        if (f.name.value.trim().length < 2) bad.push(f.name);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.value.trim())) bad.push(f.email);
        if (f.subject.value.trim().length < 2) bad.push(f.subject);
        if (f.message.value.trim().length < 10) bad.push(f.message);

        if (bad.length) {
            bad.forEach(el => el.classList.add("invalid"));
            bad[0].focus();
            setFormMsg("Please fill in every field correctly (message: at least 10 characters).", "error");
            return;
        }

        const body = f.message.value.trim() + "\n\n- " + f.name.value.trim() + " (" + f.email.value.trim() + ")";
        window.location.href = "mailto:" + MY_EMAIL +
            "?subject=" + encodeURIComponent(f.subject.value.trim()) +
            "&body=" + encodeURIComponent(body);

        setFormMsg("Your email app should now open with the message ready. Press Send there to deliver it.", "ok");
    });

    /* ---------- Footer year ---------- */
    $("#year").textContent = new Date().getFullYear();
})();