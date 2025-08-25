/**
 * Video Carousel with Mobile-Optimized Navigation
 * 
 * Features:
 * - Desktop: Scroll up/down or left/right to navigate videos
 * - Mobile: Only left/right scrolling and touch swipes navigate videos
 * - Vertical scrolling on mobile is blocked to prevent accidental navigation
 * - Touch swipe gestures work on all devices
 */

const videos = [
    {
        id: "claude-accounting",
        title: "Claude for Accounting",
        subtext: "3 minutes",
        tooltip: "Demo of Claude for Accounting, agentic AI for accountants",
        src: "videos/claude_accounting_demo.mp4",
        thumbnail: "videos/claude_accounting_thumbnail.mp4",
        still_thumbnail: "images/claude-code.png",
        type: "mp4",
        main: false,
        description: 'My Anthropic x PearVC Hackathon 2025 submission that was selected as finalist after competing with 200+ hackers and 75+ teams using MCP and Anthropic\'s Claude API. Built with JS, MCP, and REST APIs.',
        pdf: "pdfs/claude_accounting.pdf"
    },
    {
        id: "claude-billing-agent",
        title: "Claude Billing Agent",
        description: "Claude Billing Agent is an \"ambient agent\" that collaborates with Accounts Receivable teams to automatically resolve customer inquiries and expedite cash collection. Built with JS, MCP, and REST APIs.",
        subtext: "2 minutes",
        tooltip: "Demo of Claude Billing Agent to expedite cash collection.",
        src: "videos/claude_billing_agent.mp4",
        thumbnail: "videos/billing_agent_thumbnail.mp4",
        still_thumbnail: "images/claude-teamwork.png",
        type: "mp4",
        main: true,
        pdf: "pdfs/claude_billing_agent.pdf"
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
let scrollThreshold = 30;
let scrollCooldown = false;
let scrollCooldownTime = 300;

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

const handleResize = debounce(() => {
    updateCarousel();
}, 250);

function handleScrollDirection(event) {
    if (scrollCooldown) return;
    
    let scrollDelta = 0;
    let isHorizontalScroll = false;
    
    if (event.type === 'wheel') {
        if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
            scrollDelta = event.deltaX;
            isHorizontalScroll = true;
        } else {
            scrollDelta = event.deltaY;
            isHorizontalScroll = false;
        }
    } else if (event.type === 'scroll') {
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const currentScrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        const deltaTop = currentScrollTop - lastScrollTop;
        const deltaLeft = currentScrollLeft - lastScrollLeft;
        
        if (Math.abs(deltaLeft) > Math.abs(deltaTop)) {
            scrollDelta = deltaLeft;
            isHorizontalScroll = true;
        } else {
            scrollDelta = deltaTop;
            isHorizontalScroll = false;
        }
        
        lastScrollTop = currentScrollTop;
        lastScrollLeft = currentScrollLeft;
    }
    
    if (Math.abs(scrollDelta) < scrollThreshold) return;
    
    let shouldNavigate = false;
    let direction = '';
    
    if (isHorizontalScroll) {
        if (scrollDelta > 0) {
            direction = 'next';
            shouldNavigate = true;
        } else if (scrollDelta < 0) {
            direction = 'prev';
            shouldNavigate = true;
        }
    } else {
        if (window.innerWidth <= 768) {
            return;
        }
        
        if (scrollDelta > 0) {
            direction = 'next';
            shouldNavigate = true;
        } else if (scrollDelta < 0) {
            direction = 'prev';
            shouldNavigate = true;
        }
    }
    
    if (shouldNavigate) {
        if (event.type === 'wheel') {
            event.preventDefault();
        }
        
        scrollCooldown = true;
        
        const carouselContainer = document.querySelector('.carousel-container');
        carouselContainer.classList.add('scroll-feedback');
        setTimeout(() => {
            carouselContainer.classList.remove('scroll-feedback');
        }, 300);
        
        if (direction === 'next') {
            goToNext();
        } else if (direction === 'prev') {
            goToPrev();
        }
        
        setTimeout(() => {
            scrollCooldown = false;
        }, scrollCooldownTime);
    }
}

const throttledScrollHandler = throttle(handleScrollDirection, 100);

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

function initializeCarousel() {
    const mainVideoIndex = videos.findIndex(video => video.main === true);
    if (mainVideoIndex !== -1) {
        currentIndex = mainVideoIndex;
    }

    videos.forEach((video, index) => {
        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item';
        
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
                <div class="mobile-nav-container">
                    <button class="mobile-nav-button prev" data-direction="prev">
                        <i class="fas fa-long-arrow-left"></i>
                    </button>
                    <span class="video-counter">${index + 1} / ${videos.length}</span>
                    <button class="mobile-nav-button next" data-direction="next">
                        <i class="fas fa-long-arrow-right"></i>
                    </button>
                </div>
            </div>
            <div class="video-description">
                <div class="text-content">
                    <span class="video-title">${video.title}</span>
                    <p>${video.description}</p>
                    <span class="subtext">${video.subtext}</span>
                </div>
                <div class="button-row">
                    <button class="read-more-btn">View architecture</button>
                </div>
            </div>
        `;
        
        const playButton = carouselItem.querySelector('.play-button');
        playButton.addEventListener('click', () => {
            openVideoModal(video);
        });

        const readMoreBtn = carouselItem.querySelector('.read-more-btn');
        if (video.pdf) {
            readMoreBtn.addEventListener('click', () => {
                openPdfModal(video.pdf);
            });
        } else {
            readMoreBtn.style.display = 'none';
        }

        carouselItem.addEventListener('click', (e) => {
            if (carouselItem.classList.contains('adjacent') && !e.target.closest('.play-button')) {
                if (index < currentIndex) {
                    goToPrev();
                } else if (index > currentIndex) {
                    goToNext();
                }
            }
        });

        const mobilePrevBtn = carouselItem.querySelector('.mobile-nav-button.prev');
        const mobileNextBtn = carouselItem.querySelector('.mobile-nav-button.next');
        
        mobilePrevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mobilePrevBtn.classList.add('clicked');
            setTimeout(() => mobilePrevBtn.classList.remove('clicked'), 300);
            goToPrev();
        });
        
        mobileNextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileNextBtn.classList.add('clicked');
            setTimeout(() => mobileNextBtn.classList.remove('clicked'), 300);
            goToNext();
        });

        const thumbnailVideo = carouselItem.querySelector('.thumbnail-video');
        const stillThumbnail = carouselItem.querySelector('.still-thumbnail');
        if (thumbnailVideo) {
            thumbnailVideo.play();
        }
        
        carouselTrack.appendChild(carouselItem);
    });

    updateCarousel();
    
    if (window.innerWidth <= 768) {
        setTimeout(() => {
            const activeItem = document.querySelector('.carousel-item.active');
            if (activeItem) {
                const activePlayButton = activeItem.querySelector('.play-button');
                if (activePlayButton) {
                    activePlayButton.classList.add('expanded');
                }
            }
        }, 100);
    }
}

function openVideoModal(video) {
    const url = new URL(window.location.href);
    url.searchParams.set('video', video.id);
    window.history.pushState({}, '', url);

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

    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    if (window.innerWidth <= 768) {
        videoModal.offsetHeight;
        window.scrollTo(0, 0);
        videoModal.classList.add('mobile-active');
    }
}

function closeVideoModal() {
    videoModal.classList.remove('active', 'mobile-active');
    document.body.style.overflow = '';
    modalVideoContainer.innerHTML = '';
    
    const url = new URL(window.location.href);
    url.searchParams.delete('video');
    window.history.pushState({}, '', url);
}

function openPdfModal(pdfPath) {
    const url = new URL(window.location.href);
    url.searchParams.set('pdf', pdfPath);
    window.history.pushState({}, '', url);

    pdfIframe.src = pdfPath;
    pdfModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePdfModal() {
    pdfModal.classList.remove('active');
    document.body.style.overflow = '';
    pdfIframe.src = '';
    
    const url = new URL(window.location.href);
    url.searchParams.delete('pdf');
    window.history.pushState({}, '', url);
}

function updateCarousel() {
    const items = document.querySelectorAll('.carousel-item');
    
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
        item.classList.remove('active', 'adjacent');
        item.style.opacity = '0';
        item.style.left = '50%';
        item.style.transform = 'translateX(-50%)';
        
        const thumbnailVideo = item.querySelector('.thumbnail-video');
        const stillThumbnail = item.querySelector('.still-thumbnail');
        const playButton = item.querySelector('.play-button');
        
        if (index === currentIndex) {
            item.classList.add('active');
            item.style.opacity = '1';
            if (thumbnailVideo && stillThumbnail) {
                thumbnailVideo.style.display = 'block';
                stillThumbnail.style.display = 'none';
                thumbnailVideo.currentTime = 0;
                thumbnailVideo.play();
            }
            
            if (window.innerWidth <= 768 && playButton) {
                playButton.classList.remove('expanded');
                setTimeout(() => {
                    playButton.classList.add('expanded');
                }, 300);
            }
        } else if (index === currentIndex - 1) {
            item.classList.add('adjacent');
            item.style.left = `-${gapPercentage}%`;
            item.style.opacity = '.2';
            if (thumbnailVideo && stillThumbnail) {
                thumbnailVideo.style.display = 'none';
                stillThumbnail.style.display = 'block';
                thumbnailVideo.pause();
                thumbnailVideo.currentTime = 0;
            }
            
            if (playButton) {
                playButton.classList.remove('expanded');
            }
        } else if (index === currentIndex + 1) {
            item.classList.add('adjacent');
            item.style.left = `${100 + gapPercentage}%`;
            item.style.opacity = '.2';
            if (thumbnailVideo && stillThumbnail) {
                thumbnailVideo.style.display = 'none';
                stillThumbnail.style.display = 'block';
                thumbnailVideo.pause();
                thumbnailVideo.currentTime = 0;
            }
            
            if (playButton) {
                playButton.classList.remove('expanded');
            }
        }
    });

    if (window.innerWidth <= 768) {
        prevButton.style.display = 'flex';
        nextButton.style.display = 'flex';
    } else {
        prevButton.style.display = currentIndex === 0 ? 'none' : 'flex';
        nextButton.style.display = currentIndex === videos.length - 1 ? 'none' : 'flex';
    }

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

function goToNext() {
    if (currentIndex < videos.length - 1) {
        currentIndex++;
    } else {
        currentIndex = 0;
    }
    updateCarousel();
}

function goToPrev() {
    if (currentIndex > 0) {
        currentIndex--;
    } else {
        currentIndex = videos.length - 1;
    }
    updateCarousel();
}

document.addEventListener('DOMContentLoaded', () => {
    initializeCarousel();
    
    prevButton.addEventListener('click', goToPrev);
    nextButton.addEventListener('click', goToNext);

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

    modalClose.forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            if (videoModal.classList.contains('active')) {
                closeVideoModal();
            } else if (pdfModal.classList.contains('active')) {
                closePdfModal();
            }
        });
    });

    videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) {
            closeVideoModal();
        }
    });

    pdfModal.addEventListener('click', (e) => {
        if (e.target === pdfModal) {
            closePdfModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (videoModal.classList.contains('active')) {
                closeVideoModal();
            } else if (pdfModal.classList.contains('active')) {
                closePdfModal();
            }
        }
    });

    window.addEventListener('resize', handleResize);

    window.addEventListener('wheel', throttledScrollHandler, { passive: false });
    window.addEventListener('scroll', throttledScrollHandler, { passive: false });
    
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let touchStartTime = 0;
    let lastMobileScrollTop = 0;
    let lastMobileScrollLeft = 0;
    let mobileScrollTimeout;
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        touchStartTime = Date.now();
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        const touchEndTime = Date.now();
        const touchDuration = touchEndTime - touchStartTime;
        
        if (touchDuration < 300) {
            handleSwipe();
        }
    }, { passive: true });
    
    if (window.innerWidth <= 768) {
        window.addEventListener('scroll', () => {
            clearTimeout(mobileScrollTimeout);
            mobileScrollTimeout = setTimeout(() => {
                const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const currentScrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
                
                const deltaTop = currentScrollTop - lastMobileScrollTop;
                const deltaLeft = currentScrollLeft - lastMobileScrollLeft;
                
                if (Math.abs(deltaLeft) > Math.abs(deltaTop) && Math.abs(deltaLeft) > scrollThreshold) {
                    if (deltaLeft > 0) {
                        goToPrev();
                    } else {
                        goToNext();
                    }
                }
                
                lastMobileScrollTop = currentScrollTop;
                lastMobileScrollLeft = currentScrollLeft;
            }, 100);
        }, { passive: true });
    }
    
    function handleSwipe() {
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const minSwipeDistance = 50;
        
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                goToPrev();
            } else {
                goToNext();
            }
        } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > minSwipeDistance) {
            if (window.innerWidth <= 768) {
                return;
            }
            
            if (deltaY > 0) {
                goToNext();
            } else {
                goToPrev();
            }
        }
    }

    const params = new URLSearchParams(window.location.search);
    const videoId = params.get('video');
    if (videoId) {
        const video = videos.find(v => v.id === videoId);
        if (video) {
            openVideoModal(video);
        }
    }

    const pdfPath = params.get('pdf');
    if (pdfPath) {
        openPdfModal(pdfPath);
    }
});

function showNavigationPreview(button, video, position) {
    hideNavigationPreview();

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