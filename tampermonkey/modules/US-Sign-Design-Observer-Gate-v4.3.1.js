(function () {
  "use strict";

  const NativeMutationObserver = window.MutationObserver;
  if (!NativeMutationObserver || window.__usSignDesignObserverGate431) return;

  window.__usSignDesignObserverGate431 = true;

  function GatedMutationObserver(callback) {
    let pending = [];
    let timer = 0;

    const observer = new NativeMutationObserver((mutations, nativeObserver) => {
      pending.push(...mutations);
      if (timer) return;

      timer = window.setTimeout(() => {
        timer = 0;
        const batch = pending;
        pending = [];
        callback(batch, observer || nativeObserver);
      }, 48);
    });

    const nativeObserve = observer.observe.bind(observer);
    const nativeDisconnect = observer.disconnect.bind(observer);
    let broadDisconnectTimer = 0;

    observer.observe = function (target, options) {
      nativeObserve(target, options);

      const isBroadContentWatch = Boolean(
        target &&
        target.nodeType === Node.ELEMENT_NODE &&
        target.id === "content" &&
        options?.childList &&
        options?.subtree
      );

      if (isBroadContentWatch) {
        window.clearTimeout(broadDisconnectTimer);
        broadDisconnectTimer = window.setTimeout(() => {
          nativeDisconnect();
        }, 1600);
      }
    };

    observer.disconnect = function () {
      window.clearTimeout(broadDisconnectTimer);
      nativeDisconnect();
    };

    return observer;
  }

  GatedMutationObserver.prototype = NativeMutationObserver.prototype;
  Object.setPrototypeOf(GatedMutationObserver, NativeMutationObserver);
  window.MutationObserver = GatedMutationObserver;
})();
