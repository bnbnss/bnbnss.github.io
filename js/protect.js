(function () {
  var isField = function (el) {
    if (!el) return false;
    var t = el.tagName;
    return t === 'INPUT' || t === 'TEXTAREA' || !!el.isContentEditable;
  };

  document.addEventListener('contextmenu', function (e) { e.preventDefault(); }, false);
  document.addEventListener('dragstart', function (e) { e.preventDefault(); }, false);
  document.addEventListener('selectstart', function (e) {
    if (!isField(e.target)) e.preventDefault();
  }, false);
  document.addEventListener('copy', function (e) {
    if (!isField(e.target)) e.preventDefault();
  }, false);
  document.addEventListener('cut', function (e) {
    if (!isField(e.target)) e.preventDefault();
  }, false);

  document.addEventListener('keydown', function (e) {
    var k = e.key || '';
    var ctrl = e.ctrlKey || e.metaKey;

    if (k === 'F5' || k === 'F12' || k === 'F7' || k === 'F8') {
      e.preventDefault(); e.stopPropagation(); return false;
    }

    if (ctrl && !e.altKey) {
      var upper = k.length === 1 ? k.toUpperCase() : k;
      if (e.shiftKey) {
        if (upper === 'I' || upper === 'J' || upper === 'C' || upper === 'K') {
          e.preventDefault(); e.stopPropagation(); return false;
        }
        return;
      }
      if (upper === 'U' || upper === 'S' || upper === 'P' || upper === 'R') {
        e.preventDefault(); e.stopPropagation(); return false;
      }
      if (upper === 'A' || upper === 'F') {
        if (!isField(e.target)) { e.preventDefault(); e.stopPropagation(); return false; }
      }
    }
  }, true);
})();
