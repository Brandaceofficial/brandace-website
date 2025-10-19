
 // Hamburger toggle
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('show');
  });

  // Scroll-triggered fade-in
  const faders = document.querySelectorAll('.fade-in');
  const options = { threshold: 0.3, rootMargin: "0px 0px -50px 0px" };
  const appearOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('appear');
      } else {
        entry.target.classList.remove('appear');
      }
    });
  }, options);
  faders.forEach(fader => appearOnScroll.observe(fader));

  
// our clients auto scroll

document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/client-logos')
    .then(res => res.json())
    .then(data => {
      const track = document.querySelector('#clientCarousel .carousel-track');
      track.innerHTML = ''; // Clear any existing content

      data.forEach(logo => {
        const item = document.createElement('div');
        item.className = 'client-item';

        const img = document.createElement('img');
        img.src = logo.imageUrl;
        img.alt = logo.name;

        item.appendChild(img);
        track.appendChild(item);
      });

      // ✅ Now that logos are added, start the carousel
      const items = document.querySelectorAll('.client-item');
      let index = 0;

      function updateCarousel() {
        items.forEach(item => item.classList.remove('active'));
        if (items.length === 0) return;

        items[index].classList.add('active');
        const offset = (index * -200) + (window.innerWidth / 2 - 100);
        track.style.transform = `translateX(${offset}px)`;

        index = (index + 1) % items.length;
      }

      setInterval(updateCarousel, 3000);
      updateCarousel();
    })
    .catch(err => console.error('Error loading logos:', err));
});


  
  window.addEventListener("scroll", function () {
    const navbar = document.getElementById("navbar");
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // Scroll-to-top button
  const scrollTopBtn = document.getElementById('scrollTopBtn');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollTopBtn.style.display = 'block';
    } else {
      scrollTopBtn.style.display = 'none';
    }
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });




document.addEventListener('DOMContentLoaded', () => {

  const modalTriggers = document.querySelectorAll('.open-modal');
  const contactModal = document.getElementById('contactModal');
  const closeModal = document.getElementById('closeModal');
  const form = document.querySelector('.contact-form');

  // Open modal
  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      contactModal.style.display = 'block';
    });
  });

  // Close modal
  closeModal.addEventListener('click', () => {
    contactModal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    
    if (e.target === contactModal) {
      contactModal.style.display = 'none';
    }
  });

// Form validation
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = {
    name: form.name.value.trim(),
    phone: form.phone.value.trim(),
    email: form.email.value.trim(),
    service: form.service.value,
    message: form.message.value.trim()
  };
  
  if (Object.values(formData).some(value => !value)) {
    Notiflix.Notify.failure('Please fill out all fields.');
    return;
  }

  const submitBtn = form.querySelector('.submit-btn');
  submitBtn.disabled = true;
  submitBtn.classList.add('loading');

  // const isEmpty = Object.values(formData).some(value => !value);
  // if (isEmpty) {
  //   Notiflix.Notify.failure('Please fill out all fields.');
  //   return;
  // }

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (result.success) {
      Notiflix.Notify.success('Email sent successfully!');
      form.reset();
      contactModal.style.display = 'none';
    } else {
      Notiflix.Notify.failure('Something went wrong.');
    }
  } catch (error) {
    Notiflix.Notify.failure('Server error. Try again later.');
    console.error(error);
  } finally {
    submitBtn.disabled = false;
    submitBtn.classList.remove('loading');
  }
});
});










  // Form validation
//  form.addEventListener('submit', async (e) => {
//   e.preventDefault();

//   const formData = {
//     name: form.name.value.trim(),
//     phone: form.phone.value.trim(),
//     email: form.email.value.trim(),
//     service: form.service.value,
//     message: form.message.value.trim()
//   };

//   const isEmpty = Object.values(formData).some(value => !value);
//   if (isEmpty) {
//     Notiflix.Notify.failure('Please fill out all fields.');
//     return;
//   }

//   try {




//     const response = await fetch('http://localhost:3000/contact', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(formData)
//     });
    
//     const result = await response.json();

//     if (result.success) {
//       Notiflix.Notify.success('Email sent successfully!');
//       form.reset();
//       contactModal.style.display = 'none';
//     } else {
//       Notiflix.Notify.failure('Something went wrong.');
//     }
//   } catch (error) {
//     Notiflix.Notify.failure('Server error. Try again later.');
//     console.error(error);
//   }finally {
//   // Always remove loader whether success or failure
//   Notiflix.Loading.remove();
// }
// });

