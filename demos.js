function setupTabs(group) {
  const list = group.querySelector('.tabs');
  const tabs = [...list.querySelectorAll('a')];
  const panels = tabs.map(tab => document.getElementById(tab.hash.slice(1)));

  list.setAttribute('role', 'tablist');
  tabs.forEach((tab, index) => {
    const panel = panels[index];
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panel.id);
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;
  });

  function select(index) {
    tabs.forEach((tab, position) => {
      const selected = position === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[position].hidden = !selected;
      if (!selected) panels[position].querySelector('video').pause();
    });
  }

  function selectFromHash() {
    const index = tabs.findIndex(tab => tab.hash === location.hash);
    if (index !== -1) {
      select(index);
      return panels[index];
    }
  }

  list.addEventListener('click', event => {
    const tab = event.target.closest('a');
    const index = tabs.indexOf(tab);
    if (index === -1 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    select(index);
    history.replaceState(null, '', tab.hash);
  });

  list.addEventListener('keydown', event => {
    const index = tabs.indexOf(event.target);
    const targetIndexes = {
      ArrowLeft: (index - 1 + tabs.length) % tabs.length,
      ArrowRight: (index + 1) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };
    const next = targetIndexes[event.key];
    if (index === -1 || next === undefined) return;
    event.preventDefault();
    tabs[next].click();
    tabs[next].focus();
  });

  const initialPanel = selectFromHash();
  if (!initialPanel) select(0);
  window.addEventListener('hashchange', () => selectFromHash()?.scrollIntoView());
}

document.querySelectorAll('[data-tabs]').forEach(setupTabs);

const comparison = document.querySelector('[data-comparison]');
const clips = [...comparison.querySelectorAll('video')];
comparison.querySelector('.comparison-controls').hidden = false;

comparison.querySelector('[data-replay]').addEventListener('click', () => {
  clips.forEach(clip => {
    clip.currentTime = 0;
    clip.play().catch(() => {});
  });
});

comparison.querySelector('[data-pause]').addEventListener('click', () => {
  clips.forEach(clip => clip.pause());
});
