// Video data - Add your videos here
const videos = [
    {
        id: "claude-billing-agent",
        title: "Claude Billing Agent",
        description: "Claude Billing Agent is an \"ambient agent\" that collaborates with Accounts Receivable teams to automatically resolve customer inquiries and expedite cash collection. Built with JS, MCP, and REST APIs.",
        subtext: "2 minutes",
        tooltip: "Demo of Claude Billing Agent to expedite cash collection.",
        src: "videos/claude_billing_agent.mp4",
        thumbnail: "videos/billing_agent_thumbnail.mp4",
        still_thumbnail: "images/claude-holding.png",
        type: "mp4",
        main: false,
        pdf: "pdfs/claude_billing_agent.pdf"
    },
    {
        id: "claude-accounting",
        title: "Claude for Accounting",
        subtext: "3 minutes",
        tooltip: "Demo of Claude for Accounting, agentic AI for accountants",
        src: "videos/claude_accounting_demo.mp4",
        thumbnail: "videos/claude_accounting_thumbnail.mp4",
        still_thumbnail: "images/claude-code.png",
        type: "mp4",
        main: true,
        description: 'My Anthropic x PearVC Hackathon 2025 submission that was selected as finalist after competing with 200+ hackers and 75+ teams using MCP and Anthropic\'s Claude API. Built with JS, MCP, and REST APIs.',
        pdf: "pdfs/claude_accounting.pdf"
    },
    {
        id: "claude-p2p-agent",
        title: "Claude Procure-to-Pay Agent",
        description: "Claude P2P Agent is a cross-functional agent that lives directly in your Slack, helping the Procurement and T&E teams expedite spend and expense approvals. Built with JS, Python, MCP, and SOAP/REST APIs.",
        subtext: "2 minutes",
        tooltip: "Demo of Claude P2P Agent living in your Slack to expedite expensing.",
        src: "videos/claude_p2p_agent.mp4",
        thumbnail: "videos/claude_p2p_agent_thumbnail.mp4",
        still_thumbnail: "images/claude-person.png",
        type: "mp4",
        main: false,
        pdf: "pdfs/claude_p2p_agent.pdf"
    }
];

// DOM Elements
const carouselTrack = document.querySelector('.carousel-track');
const prevButton = document.querySelector('.carousel-button.prev');
const nextButton = document.querySelector('.carousel-button.next');
const videoModal = document.getElementById('videoModal');
const pdfModal = document.getElementById('pdfModal');
const modalClose = document.querySelectorAll('.modal-close');
const modalVideoContainer = document.querySelector('.modal-content .video-container');
const pdfIframe = document.getElementById('pdfIframe');

let currentIndex = 0;
let resizeTimeout;
let lastScrollTop = 0;
let lastScrollLeft = 0;
let scrollThreshold = 30; // Reduced threshold for more responsive navigation
let scrollCooldown = false;
let scrollCooldownTime = 300; // Reduced cooldown time for better responsiveness

// Debounce function to limit how often the resize handler runs
function debounce(func, wait) {
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(resizeTimeout);
            func(...args);
        };
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(later, wait);
    };
}

// Handle window resize
const handleResize = debounce(() => {
    updateCarousel();
}, 250); // Wait 250ms after resize stops before updating

// Handle scroll direction detection and navigation
function handleScrollDirection(event) {
    if (scrollCooldown) return;
    
    let scrollDelta = 0;
    let isHorizontalScroll = false;
    
    // Determine scroll type and direction
    if (event.type === 'wheel') {
        // Mouse wheel scroll
        if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
            // Horizontal scroll
            scrollDelta = event.deltaX;
            isHorizontalScroll = true;
        } else {
            // Vertical scroll
            scrollDelta = event.deltaY;
            isHorizontalScroll = false;
        }
    } else if (event.type === 'scroll') {
        // Touch scroll or programmatic scroll
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const currentScrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        if (Math.abs(currentScrollLeft - lastScrollLeft) > Math.abs(currentScrollTop - lastScrollTop)) {
            // Horizontal scroll
            scrollDelta = currentScrollLeft - lastScrollLeft;
            isHorizontalScroll = true;
        } else {
            // Vertical scroll
            scrollDelta = currentScrollTop - lastScrollTop;
            isHorizontalScroll = false;
        }
        
        lastScrollTop = currentScrollTop;
        lastScrollLeft = currentScrollLeft;
    }
    
    // Check if scroll distance meets threshold
    if (Math.abs(scrollDelta) < scrollThreshold) return;
    
    // Determine navigation direction
    let shouldNavigate = false;
    let direction = '';
    
    if (isHorizontalScroll) {
        // Left scroll = previous, Right scroll = next
        if (scrollDelta > 0) {
            direction = 'next';
            shouldNavigate = true;
        } else if (scrollDelta < 0) {
            direction = 'prev';
            shouldNavigate = true;
        }
    } else {
        // Down scroll = next, Up scroll = previous
        if (scrollDelta > 0) {
            direction = 'next';
            shouldNavigate = true;
        } else if (scrollDelta < 0) {
            direction = 'prev';
            shouldNavigate = true;
        }
    }
    
    // Navigate if conditions are met
    if (shouldNavigate) {
        // Prevent default scroll behavior for wheel events
        if (event.type === 'wheel') {
            event.preventDefault();
        }
        
        scrollCooldown = true;
        
        // Add visual feedback
        const carouselContainer = document.querySelector('.carousel-container');
        carouselContainer.classList.add('scroll-feedback');
        setTimeout(() => {
            carouselContainer.classList.remove('scroll-feedback');
        }, 300);
        
        console.log(`Scroll navigation: ${direction} (${isHorizontalScroll ? 'horizontal' : 'vertical'} scroll)`);
        
        if (direction === 'next') {
            goToNext();
        } else if (direction === 'prev') {
            goToPrev();
        }
        
        // Reset cooldown after delay
        setTimeout(() => {
            scrollCooldown = false;
        }, scrollCooldownTime);
    }
}

// Throttled scroll handler
const throttledScrollHandler = throttle(handleScrollDirection, 100);

// Throttle function to limit how often a function can be called
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Initialize the carousel
function initializeCarousel() {
    // Find the main video index
    const mainVideoIndex = videos.findIndex(video => video.main === true);
    if (mainVideoIndex !== -1) {
        currentIndex = mainVideoIndex;
    }

    // Create carousel items
    videos.forEach((video, index) => {
        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item';
        
        // Create thumbnail content based on type
        let thumbnailContent = '';
        if (video.thumbnail.endsWith('.mp4')) {
            thumbnailContent = `
                <video class="thumbnail-video" muted loop playsinline>
                    <source src="${video.thumbnail}" type="video/mp4">
                </video>
                <img class="still-thumbnail" src="${video.still_thumbnail}" alt="${video.title}" style="display: none;">
            `;
        } else {
            thumbnailContent = `<img src="${video.thumbnail}" alt="${video.title}">`;
        }

        carouselItem.innerHTML = `
            <div class="thumbnail-container">
                ${thumbnailContent}
                <div class="play-button-overlay">
                    <button class="play-button" data-duration="${video.subtext}">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
            </div>
            <div class="video-description">
                <div class="text-content">
                    <span class="video-title">${video.title}</span>
                    <p>${video.description}</p>
                    <span class="subtext">${video.subtext}</span>
                </div>
                <button class="read-more-btn">View architecture</button>
            </div>
        `;
        
        // Add click event to play video only on the play button
        const playButton = carouselItem.querySelector('.play-button');
        playButton.addEventListener('click', () => {
            openVideoModal(video);
        });

        // Add click event for PDF button
        const readMoreBtn = carouselItem.querySelector('.read-more-btn');
        if (video.pdf) {
            readMoreBtn.addEventListener('click', () => {
                openPdfModal(video.pdf);
            });
        } else {
            readMoreBtn.style.display = 'none'; // Hide button if no PDF
        }

        // Add click event to navigate when clicking adjacent items
        carouselItem.addEventListener('click', (e) => {
            // Only handle clicks if it's an adjacent item and not on the play button
            if (carouselItem.classList.contains('adjacent') && !e.target.closest('.play-button')) {
                if (index < currentIndex) {
                    goToPrev();
                } else if (index > currentIndex) {
                    goToNext();
                }
            }
        });

        // Start playing video thumbnails
        const thumbnailVideo = carouselItem.querySelector('.thumbnail-video');
        const stillThumbnail = carouselItem.querySelector('.still-thumbnail');
        if (thumbnailVideo) {
            thumbnailVideo.play();
        }
        
        carouselTrack.appendChild(carouselItem);
    });

    // Set initial state
    updateCarousel();
}

// Open video modal
function openVideoModal(video) {
    // Update URL with video ID
    const url = new URL(window.location.href);
    url.searchParams.set('video', video.id);
    window.history.pushState({}, '', url);

    // Load video content
    if (video.type === 'youtube') {
        modalVideoContainer.innerHTML = `
            <iframe 
                src="${video.src}" 
                title="${video.title}"
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `;
    } else {
        modalVideoContainer.innerHTML = `
            <video controls autoplay>
                <source src="${video.src}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        `;
    }

    // Show modal
    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Fix mobile positioning issues
    if (window.innerWidth <= 768) {
        // Force reflow and ensure proper positioning on mobile
        videoModal.offsetHeight;
        window.scrollTo(0, 0);
        
        // Add mobile-specific class for additional styling
        videoModal.classList.add('mobile-active');
    }
}

// Close video modal
function closeVideoModal() {
    videoModal.classList.remove('active', 'mobile-active');
    document.body.style.overflow = ''; // Restore scrolling
    
    // Clear video content
    modalVideoContainer.innerHTML = '';
    
    // Update URL to remove video parameter
    const url = new URL(window.location.href);
    url.searchParams.delete('video');
    window.history.pushState({}, '', url);
}

// Open PDF modal
function openPdfModal(pdfPath) {
    // Update URL with PDF parameter
    const url = new URL(window.location.href);
    url.searchParams.set('pdf', pdfPath);
    window.history.pushState({}, '', url);

    // Load PDF content
    pdfIframe.src = pdfPath;

    // Show modal
    pdfModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

// Close PDF modal
function closePdfModal() {
    pdfModal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
    
    // Clear PDF content
    pdfIframe.src = '';
    
    // Update URL to remove PDF parameter
    const url = new URL(window.location.href);
    url.searchParams.delete('pdf');
    window.history.pushState({}, '', url);
}

// Update carousel state
function updateCarousel() {
    const items = document.querySelectorAll('.carousel-item');
    const containerWidth = carouselTrack.offsetWidth;
    
    const getGapPercentage = () => {
        const breakpoints = [
            { width: 680, gap: 50 },
            { width: 710, gap: 30 },
            { width: 768, gap: 25 },
            { width: 1024, gap: 30 },
            { width: 1440, gap: 30 },
            { width: Infinity, gap: 30 }
        ];
        return breakpoints.find(({ width }) => window.innerWidth <= width).gap;
    };
    
    const gapPercentage = getGapPercentage();
    
    items.forEach((item, index) => {
        // Reset all items
        item.classList.remove('active', 'adjacent');
        item.style.opacity = '0';
        item.style.left = '50%';
        item.style.transform = 'translateX(-50%)';
        
        const thumbnailVideo = item.querySelector('.thumbnail-video');
        const stillThumbnail = item.querySelector('.still-thumbnail');
        
        if (index === currentIndex) {
            // Active item
            item.classList.add('active');
            item.style.opacity = '1';
            if (thumbnailVideo && stillThumbnail) {
                thumbnailVideo.style.display = 'block';
                stillThumbnail.style.display = 'none';
                thumbnailVideo.currentTime = 0;
                thumbnailVideo.play();
            }
        } else if (index === currentIndex - 1) {
            // Previous item
            item.classList.add('adjacent');
            item.style.left = `-${gapPercentage}%`;
            item.style.opacity = '.2';
            if (thumbnailVideo && stillThumbnail) {
                thumbnailVideo.style.display = 'none';
                stillThumbnail.style.display = 'block';
                thumbnailVideo.pause();
                thumbnailVideo.currentTime = 0;
            }
        } else if (index === currentIndex + 1) {
            // Next item
            item.classList.add('adjacent');
            item.style.left = `${100 + gapPercentage}%`;
            item.style.opacity = '.2';
            if (thumbnailVideo && stillThumbnail) {
                thumbnailVideo.style.display = 'none';
                stillThumbnail.style.display = 'block';
                thumbnailVideo.pause();
                thumbnailVideo.currentTime = 0;
            }
        }
    });

    // Update navigation buttons state
    prevButton.style.display = currentIndex === 0 ? 'none' : 'flex';
    nextButton.style.display = currentIndex === videos.length - 1 ? 'none' : 'flex';

    // Update tooltip content if it's currently being shown
    const existingPreview = document.querySelector('.navigation-preview');
    if (existingPreview) {
        const isPrevButton = existingPreview.parentElement === prevButton;
        const videoIndex = isPrevButton ? currentIndex - 1 : currentIndex + 1;
        
        if (videoIndex >= 0 && videoIndex < videos.length) {
            const video = videos[videoIndex];
            const position = isPrevButton ? 'left' : 'right';
            showNavigationPreview(isPrevButton ? prevButton : nextButton, video, position);
        } else {
            hideNavigationPreview();
        }
    }
}

// Handle navigation
function goToNext() {
    if (currentIndex < videos.length - 1) {
        currentIndex++;
        updateCarousel();
    }
}

function goToPrev() {
    if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeCarousel();
    
    // Add click events to navigation buttons
    prevButton.addEventListener('click', goToPrev);
    nextButton.addEventListener('click', goToNext);

    // Add hover preview for navigation buttons
    prevButton.addEventListener('mouseenter', () => {
        if (currentIndex > 0) {
            const prevVideo = videos[currentIndex - 1];
            showNavigationPreview(prevButton, prevVideo, 'left');
        }
    });

    nextButton.addEventListener('mouseenter', () => {
        if (currentIndex < videos.length - 1) {
            const nextVideo = videos[currentIndex + 1];
            showNavigationPreview(nextButton, nextVideo, 'right');
        }
    });

    prevButton.addEventListener('mouseleave', hideNavigationPreview);
    nextButton.addEventListener('mouseleave', hideNavigationPreview);

    // Add click events to modal close buttons
    modalClose.forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            if (videoModal.classList.contains('active')) {
                closeVideoModal();
            } else if (pdfModal.classList.contains('active')) {
                closePdfModal();
            }
        });
    });

    // Close video modal when clicking outside
    videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) {
            closeVideoModal();
        }
    });

    // Close PDF modal when clicking outside
    pdfModal.addEventListener('click', (e) => {
        if (e.target === pdfModal) {
            closePdfModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (videoModal.classList.contains('active')) {
                closeVideoModal();
            } else if (pdfModal.classList.contains('active')) {
                closePdfModal();
            }
        }
    });

    // Add resize event listener
    window.addEventListener('resize', handleResize);

    // Add scroll direction detection
    window.addEventListener('wheel', throttledScrollHandler, { passive: false });
    window.addEventListener('scroll', throttledScrollHandler, { passive: false });
    
    // Add touch events for mobile devices
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const minSwipeDistance = 50;
        
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            // Horizontal swipe
            if (deltaX > 0) {
                goToPrev(); // Swipe right = previous
            } else {
                goToNext(); // Swipe left = next
            }
        } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > minSwipeDistance) {
            // Vertical swipe
            if (deltaY > 0) {
                goToNext(); // Swipe down = next
            } else {
                goToPrev(); // Swipe up = previous
            }
        }
    }

    // Check for video ID in URL
    const params = new URLSearchParams(window.location.search);
    const videoId = params.get('video');
    if (videoId) {
        const video = videos.find(v => v.id === videoId);
        if (video) {
            openVideoModal(video);
        }
    }

    // Check for PDF in URL
    const pdfPath = params.get('pdf');
    if (pdfPath) {
        openPdfModal(pdfPath);
    }
});

// Add these new functions after the existing functions
function showNavigationPreview(button, video, position) {
    // Remove any existing preview
    hideNavigationPreview();

    // Create preview element
    const preview = document.createElement('div');
    preview.className = 'navigation-preview';
    preview.style[position] = '100%';
    
    preview.innerHTML = `
        <div class="preview-content">
            <h3>${video.title}</h3>
            <p>${video.tooltip}</p>
            <span class="preview-subtext">${video.subtext}</span>
        </div>
    `;

    button.appendChild(preview);
    }

function hideNavigationPreview() {
    const existingPreview = document.querySelector('.navigation-preview');
    if (existingPreview) {
        existingPreview.remove();
    }
} 