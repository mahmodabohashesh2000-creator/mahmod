import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// وظيفة إخفاء شاشة التحميل
const hideLoader = () => {
  const loader = document.getElementById('loading-screen');
  if (loader) {
    loader.style.opacity = '0';
    loader.style.transition = 'opacity 0.4s ease';
    setTimeout(() => {
      loader.style.display = 'none';
    }, 400);
  }
};

const container = document.getElementById('root');

if (container) {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    // إخفاء التحميل بعد نجاح العرض الأولي
    setTimeout(hideLoader, 1000);
  } catch (error) {
    console.error("Critical Start Error:", error);
    // في حالة فشل React، نظهر زر الطوارئ
    const loader = document.getElementById('loading-screen');
    if (loader) {
      loader.innerHTML += '<button onclick="location.reload()" style="margin-top:20px; padding:10px 20px; background:#2b579a; color:white; border-radius:8px; border:none; cursor:pointer;">إعادة تشغيل النظام</button>';
    }
  }
}