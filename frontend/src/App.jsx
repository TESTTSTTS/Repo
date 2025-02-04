import React, { useEffect } from 'react';
import CV from './components/CV';
import './App.css';

function App() {
  useEffect(() => {
    // Функция для получения информации об устройстве
    const getDeviceInfo = () => {
      const nav = window.navigator;
      const screen = window.screen;
      
      return {
        // Экран и окно
        screenResolution: `${screen.width}x${screen.height}`,
        screenAvailable: `${screen.availWidth}x${screen.availHeight}`,
        screenColorDepth: screen.colorDepth,
        screenPixelRatio: window.devicePixelRatio,
        windowSize: `${window.innerWidth}x${window.innerHeight}`,
        windowOuterSize: `${window.outerWidth}x${window.outerHeight}`,

        // Система и устройство
        platform: nav.platform,
        userAgent: nav.userAgent,
        vendor: nav.vendor,
        cpuCores: nav.hardwareConcurrency,
        deviceMemory: nav?.deviceMemory,
        maxTouchPoints: nav.maxTouchPoints,
        
        // Сеть и соединение
        connectionType: nav.connection?.type,
        connectionSpeed: nav.connection?.effectiveType,
        connectionSaveData: nav.connection?.saveData,
        onLine: nav.onLine,

        // Язык и локализация
        language: nav.language,
        languages: nav.languages,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: new Date().getTimezoneOffset(),

        // Возможности браузера
        cookiesEnabled: nav.cookieEnabled,
        doNotTrack: nav.doNotTrack,
        pdfViewerEnabled: nav.pdfViewerEnabled,
        webdriver: nav.webdriver,

        // Медиа возможности
        audioCodecs: {
          mp3: !!document.createElement('audio').canPlayType('audio/mpeg'),
          ogg: !!document.createElement('audio').canPlayType('audio/ogg'),
          wav: !!document.createElement('audio').canPlayType('audio/wav')
        },
        videoCodecs: {
          h264: !!document.createElement('video').canPlayType('video/mp4; codecs="avc1.42E01E"'),
          webm: !!document.createElement('video').canPlayType('video/webm; codecs="vp8, vorbis"'),
          ogg: !!document.createElement('video').canPlayType('video/ogg; codecs="theora"')
        },

        // Графические возможности
        webgl: (() => {
          try {
            const canvas = document.createElement('canvas');
            return !!canvas.getContext('webgl') || !!canvas.getContext('experimental-webgl');
          } catch (e) {
            return false;
          }
        })(),
        canvas2d: (() => {
          try {
            const canvas = document.createElement('canvas');
            return !!canvas.getContext('2d');
          } catch (e) {
            return false;
          }
        })(),

        // Дополнительные возможности
        batterySupport: 'getBattery' in navigator,
        bluetoothSupport: 'bluetooth' in navigator,
        geoLocationSupport: 'geolocation' in navigator,
        webRTCSupport: 'RTCPeerConnection' in window,
        webSocketSupport: 'WebSocket' in window,
        webWorkerSupport: 'Worker' in window,
        serviceWorkerSupport: 'serviceWorker' in navigator,
        storageQuota: {
          persistent: nav?.storage?.persist,
          temporary: nav?.storage?.temporary
        },

        // Дата и время визита
        visitTime: new Date().toISOString(),
        visitTimestamp: Date.now()
      };
    };

    // Отправка данных о визите
    const recordVisit = async () => {
      try {
        const response = await fetch('/api/visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            device_info: getDeviceInfo()
          })
        });
        const data = await response.json();
        console.log('Visit recorded:', data);
      } catch (error) {
        console.error('Error recording visit:', error);
      }
    };

    recordVisit();
  }, []); // Пустой массив зависимостей - выполнится только при монтировании

  return (
    <div className="app">
      <CV />
    </div>
  );
}

export default App;