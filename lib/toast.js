import Swal from 'sweetalert2';

export const showToast = (title, icon = 'success') => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const Toast = Swal.mixin({
    toast: true,
    // মোবাইলে উপরে মাঝখানে (top), পিসিতে উপরে ডানে (top-end)
    position: isMobile ? 'top' : 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    },
    // Z-index ফিক্স যাতে সবকিছুর উপরে থাকে
    customClass: {
      container: 'z-[9999]', 
      popup: 'rounded-2xl border border-slate-100 shadow-2xl font-sans font-bold transition-all duration-300',
      title: 'text-sm md:text-base'
    }
  });

  Toast.fire({
    icon: icon,
    title: title,
    background: '#ffffff',
    color: '#1e293b',
  });
};

// বড় পপ-আপ এর জন্য (সফল বা ব্যর্থ মেসেজ)
export const showAlert = (title, text, icon = 'info') => {
    Swal.fire({
        title: title,
        text: text,
        icon: icon,
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#4f46e5',
        background: '#ffffff',
        // বড় পপআপের জন্য z-index এবং রেসপন্সিভ প্যাডিং
        customClass: {
            container: 'z-[9999]',
            popup: 'rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 font-sans shadow-2xl mx-4',
            title: 'text-xl md:text-2xl font-black text-slate-800',
            confirmButton: 'px-8 py-3 rounded-2xl font-black focus:ring-0 outline-none'
        },
        showClass: {
            popup: 'animate__animated animate__fadeInUp animate__faster'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutDown animate__faster'
        }
    });
};