/* Loads assets/data/system.json (written by .githooks/pre-commit via scripts/update-system.sh) into
   QLEX.identity.system and announces it with a 'qlex:system' event. Silent fallback on file:// or when missing. */
(function () {
  const here = document.currentScript && document.currentScript.src ? new URL('../data/', document.currentScript.src) : new URL('assets/data/', location.href);
  fetch(new URL('system.json', here), { cache: 'no-store' })
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(j => {
      const I = window.QLEX && window.QLEX.identity; if (!I) return;
      const S = I.system = I.system || {};
      if (j.rev) { S.rev = j.rev; I.rev = j.rev; I.revShort = j.rev.slice(2).split('.').reverse().join('.'); }
      if (j.build != null) S.build = j.build;
      if (j.commit) S.commit = j.commit;
      if (j.committedAt) S.committedAt = j.committedAt;
      if (j.firstCommitAt) S.bootedAt = Date.parse(j.firstCommitAt);
      if (j.lastNote && j.lastNote.n) S.lastNote = { n: j.lastNote.n, date: j.lastNote.date };
      if (j.lastExperiment && j.lastExperiment.n) S.lastExperiment = j.lastExperiment;
      document.dispatchEvent(new CustomEvent('qlex:system', { detail: j }));
    })
    .catch(() => {});
})();
