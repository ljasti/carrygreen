// Amrot Website JavaScript

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    // Create mobile navigation toggle if it doesn't exist
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');
    
    if (!document.querySelector('.nav-toggle')) {
        const navToggle = document.createElement('div');
        navToggle.className = 'nav-toggle';
        navToggle.innerHTML = '<span></span><span></span><span></span>';
        header.appendChild(navToggle);
        
        navToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
    
    // Close mobile nav when clicking on links
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            nav.classList.remove('active');
            document.querySelector('.nav-toggle').classList.remove('active');
        });
    });
    
    // FAQ Functionality - Complete rewrite with direct DOM manipulation for Opera compatibility
    function initFAQ() {
        try {
            // Get all FAQ items
            const faqItems = document.querySelectorAll('.faq-item');
            if (!faqItems || faqItems.length === 0) return;
            
            // First, completely reset all FAQ items and hide all answers
            faqItems.forEach(item => {
                const question = item.querySelector('.faq-question');
                const answer = item.querySelector('.faq-answer');
                
                if (question) question.classList.remove('active');
                if (answer) {
                    answer.classList.remove('active');
                    answer.style.display = 'none';
                    answer.style.height = '0';
                    answer.style.opacity = '0';
                    answer.style.padding = '0';
                }
            });
            
            // Remove all existing event listeners by replacing elements
            faqItems.forEach(item => {
                const oldQuestion = item.querySelector('.faq-question');
                if (!oldQuestion) return;
                
                // Create a completely new element
                const newQuestion = document.createElement('div');
                newQuestion.className = oldQuestion.className;
                newQuestion.innerHTML = oldQuestion.innerHTML;
                newQuestion.setAttribute('style', oldQuestion.getAttribute('style') || '');
                
                // Replace the old question with the new one
                if (oldQuestion.parentNode) {
                    oldQuestion.parentNode.replaceChild(newQuestion, oldQuestion);
                }
                
                // Add a direct onclick handler (most compatible approach)
                newQuestion.onclick = function(e) {
                    if (e) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    
                    const answer = this.nextElementSibling;
                    if (!answer) return;
                    
                    const isActive = this.classList.contains('active');
                    
                    // Close all other FAQ items first
                    faqItems.forEach(otherItem => {
                        const otherQuestion = otherItem.querySelector('.faq-question');
                        const otherAnswer = otherItem.querySelector('.faq-answer');
                        
                        if (otherQuestion && otherQuestion !== this && otherAnswer) {
                            otherQuestion.classList.remove('active');
                            otherAnswer.classList.remove('active');
                            otherAnswer.style.display = 'none';
                            otherAnswer.style.height = '0';
                            otherAnswer.style.opacity = '0';
                            otherAnswer.style.padding = '0';
                        }
                    });
                    
                    // Toggle current item
                    if (isActive) {
                        // Close this item
                        this.classList.remove('active');
                        answer.classList.remove('active');
                        answer.style.height = '0';
                        answer.style.opacity = '0';
                        answer.style.padding = '0';
                        
                        // Use setTimeout to ensure the transition is complete before hiding
                        setTimeout(function() {
                            answer.style.display = 'none';
                        }, 300);
                    } else {
                        // Open this item
                        this.classList.add('active');
                        answer.classList.add('active');
                        answer.style.display = 'block';
                        
                        // Force reflow before setting height
                        void answer.offsetWidth;
                        
                        // Set properties for open state
                        answer.style.height = 'auto';
                        answer.style.opacity = '1';
                        answer.style.padding = '1.5rem';
                    }
                    
                    return false; // Prevent any default behavior
                };
            });
            
            // DO NOT open any FAQ item by default - all should be closed initially
            // Removed the code that automatically opens the first FAQ item
            
            console.log('FAQ initialization complete - all items closed by default');
        } catch (error) {
            console.error('Error initializing FAQ:', error);
        }
    }
    
    // Initialize FAQ when DOM is loaded
    document.addEventListener('DOMContentLoaded', initFAQ);
    
    // Also initialize when window is fully loaded (backup)
    window.addEventListener('load', function() {
        console.log('Window loaded, initializing FAQ again');
        initFAQ();
    });

    
    // Smooth scrolling for navigation links
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Performance optimization: Lazy loading for images
    const images = document.querySelectorAll('img');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
    });
    
    // Add loading animation
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
    });

    // Phone field validation - only allow numbers and + character
    const phoneInput = document.querySelector('#phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // Remove any characters that are not numbers or +
            this.value = this.value.replace(/[^0-9+]/g, '');
        });
    }

    // Form submission handling
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate phone number format if provided
            const phoneValue = phoneInput.value.trim();
            if (phoneValue && !/^[+]?[0-9]+$/.test(phoneValue)) {
                alert('Please enter a valid phone number (only numbers and + are allowed).');
                return;
            }
            
            // In a real implementation, you would send the form data to a server
            // For this demo, we'll just show a success message
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }
    
    // Add active class to navigation links based on scroll position
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 100; // Offset for header
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`nav a[href="#${sectionId}"]`);
            
            if (navLink && scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                document.querySelectorAll('nav a').forEach(link => {
                    link.classList.remove('active');
                });
                navLink.classList.add('active');
            }
        });
    }
    
    // Add active class to navigation links on page load and scroll
    updateActiveNavLink();
    window.addEventListener('scroll', updateActiveNavLink);
});

// Performance: Debounced scroll handler
let scrollTimeout;
window.addEventListener('scroll', function() {
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
    
    scrollTimeout = setTimeout(function() {
        const scrolled = window.pageYOffset;
        const header = document.querySelector('header');
        
        if (scrolled > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.background = 'white';
            header.style.backdropFilter = 'none';
        }
    }, 10);
});