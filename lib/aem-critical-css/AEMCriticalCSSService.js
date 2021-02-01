const CACHE_HOLDER_ATTR = '_aemCriticalCSSHistoryCache';

var CSSLoadingService = {
  isCSSInjected: function (css) {
    var runtimeCache = CSSLoadingService.getCacheHolder();
    return runtimeCache[css] || false;
  },

  markAsInjected: function (css) {
    var runtimeCache = CSSLoadingService.getCacheHolder();
    runtimeCache[css] = true;
  },

  shouldInject: function (css) {
    if (!CSSLoadingService.isCSSInjected(css)) {
      this.markAsInjected(css);
      return true;
    }
    return false;
  },

  getCacheHolder: function () {
    if (!request.getAttribute(CACHE_HOLDER_ATTR)) {
      request.setAttribute(CACHE_HOLDER_ATTR, {});
    }
    return request.getAttribute(CACHE_HOLDER_ATTR);
  }
};