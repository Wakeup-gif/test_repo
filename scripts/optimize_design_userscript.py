from pathlib import Path
import re

SOURCE = Path("tampermonkey/US-Sign-Design-Job-Tools-v4.1.0.user.js")
TARGET = Path("tampermonkey/US-Sign-Design-Job-Tools.user.js")
VERSION = "4.1.1"

text = SOURCE.read_text(encoding="utf-8")

text = re.sub(r"// @version\s+4\.1\.0", f"// @version      {VERSION}", text, count=1)
text = re.sub(
    r"// @description\s+Stable full-width Design workspace with robust hidden Open Date and Project Manager detection\.",
    "// @description  Stable Design workspace with bounded startup discovery, one scoped data observer, and no permanent content watcher.",
    text,
    count=1,
)

metadata_end = "// ==/UserScript=="
update_lines = (
    "// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Design-Job-Tools.user.js\n"
    "// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Design-Job-Tools.user.js\n"
)
if "// @updateURL" not in text.split(metadata_end, 1)[0]:
    text = text.replace(metadata_end, update_lines + metadata_end, 1)

text = text.replace('  const VERSION = "4.1.0";', f'  const VERSION = "{VERSION}";', 1)

old_state = '''  const state = {
    table: null,
    workspace: null,
    data: null,
    mounting: false,
    rebuildTimer: null,
    refreshTimer: null,
    structureObserver: null,
    dataObserver: null
  };'''
new_state = '''  const state = {
    table: null,
    workspace: null,
    data: null,
    mounting: false,
    refreshTimer: null,
    startupTimer: null,
    startupStopTimer: null,
    startupObserver: null,
    dataObserver: null,
    lastDataSignature: ""
  };'''
if old_state not in text:
    raise SystemExit("State block not found; source changed unexpectedly.")
text = text.replace(old_state, new_state, 1)

start_marker = '''  function refreshData() {'''
end_marker = '''  function installNavigationEvents() {'''
start = text.find(start_marker)
end = text.find(end_marker, start)
if start < 0 or end < 0:
    raise SystemExit("Design runtime lifecycle markers were not found.")

replacement = r'''  function dataSignature(data) {
    return JSON.stringify([
      data.projectNumber,
      data.designNumber,
      data.projectRevision,
      data.projectReference,
      data.plazaName,
      data.openDate,
      data.projectManager,
      data.designer,
      data.fullAddress,
      data.streetAddress,
      data.city,
      data.stateZip,
      data.designType,
      data.dateRequired,
      data.priority,
      data.hours,
      data.status,
      data.description
    ]);
  }

  function refreshData() {
    if (
      !state.table?.isConnected ||
      !state.workspace?.workspaceBody?.isConnected
    ) {
      disconnectDataObserver();
      startDiscovery();
      return;
    }

    const data = collectJobData(
      state.table,
      state.workspace
    );

    const signature = dataSignature(data);
    if (signature === state.lastDataSignature) {
      return;
    }

    state.lastDataSignature = signature;
    state.data = data;

    const overview = document.getElementById(IDS.overview);
    const copyTools = document.getElementById(IDS.copyTools);
    const summary = document.getElementById(IDS.summary);

    if (overview) {
      updateOverview(overview, data);
    }

    if (summary) {
      updateSummary(summary, data);
    }

    if (copyTools) {
      updateCopyButtons(copyTools, data);
    }

    ensureLookupButton(data);
  }

  function scheduleRefresh(delay = 140) {
    window.clearTimeout(state.refreshTimer);
    state.refreshTimer = window.setTimeout(refreshData, delay);
  }

  function disconnectDataObserver() {
    state.dataObserver?.disconnect();
  }

  function connectDataObserver() {
    disconnectDataObserver();

    if (!state.dataObserver) {
      state.dataObserver = new MutationObserver(() => {
        if (!state.mounting) {
          scheduleRefresh(140);
        }
      });
    }

    const roots = [
      state.table,
      document.querySelector("#customer-name"),
      document.querySelector("#customer-info"),
      document.querySelector("#pmlt")
    ].filter(Boolean);

    for (const root of roots) {
      state.dataObserver.observe(root, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }
  }

  function mountDesignWorkspace() {
    if (state.mounting) {
      return false;
    }

    state.mounting = true;
    disconnectDataObserver();
    let mounted = false;

    try {
      installStyles();

      const table = findDesignTable();
      if (!table) {
        state.table = null;
        state.workspace = null;
        return false;
      }

      const workspace = findWorkspace(table);
      if (!workspace) {
        return false;
      }

      state.table = table;
      state.workspace = workspace;

      const {
        actionbar,
        copyTools
      } = ensureActionbar(workspace);

      let overview = document.getElementById(IDS.overview);
      if (!overview) {
        overview = createOverview();
      }

      const summary = ensureSummaryHost();

      ensureOrderedBefore(
        workspace.workspaceBody,
        workspace.tableAnchor,
        [actionbar, overview, summary]
      );

      ensureBottomGrid(workspace);
      hideSourceRecord(table);

      const data = collectJobData(table, workspace);
      state.data = data;
      state.lastDataSignature = dataSignature(data);

      updateOverview(overview, data);
      updateSummary(summary, data);
      updateCopyButtons(copyTools, data);
      ensureLookupButton(data);

      mounted = true;
      return true;
    } finally {
      state.mounting = false;
      if (mounted) {
        connectDataObserver();
      }
    }
  }

  function stopDiscovery() {
    window.clearTimeout(state.startupTimer);
    window.clearTimeout(state.startupStopTimer);
    state.startupTimer = null;
    state.startupStopTimer = null;
    state.startupObserver?.disconnect();
    state.startupObserver = null;
  }

  function scheduleDiscoveryAttempt(delay = 80) {
    window.clearTimeout(state.startupTimer);
    state.startupTimer = window.setTimeout(() => {
      state.startupTimer = null;
      if (mountDesignWorkspace()) {
        stopDiscovery();
      }
    }, delay);
  }

  function startDiscovery() {
    stopDiscovery();
    disconnectDataObserver();
    state.lastDataSignature = "";

    scheduleDiscoveryAttempt(0);

    const content = document.querySelector("#content");
    if (content) {
      state.startupObserver = new MutationObserver(() => {
        scheduleDiscoveryAttempt(90);
      });
      state.startupObserver.observe(content, {
        childList: true,
        subtree: true
      });
    }

    window.setTimeout(() => scheduleDiscoveryAttempt(0), 350);
    window.setTimeout(() => scheduleDiscoveryAttempt(0), 1100);
    window.setTimeout(() => scheduleDiscoveryAttempt(0), 2200);

    state.startupStopTimer = window.setTimeout(() => {
      stopDiscovery();
    }, 3600);
  }

'''

text = text[:start] + replacement + text[end:]

text = text.replace(
    '''      () => scheduleRebuild(40)''',
    '''      startDiscovery'''
)

old_start = '''  function start() {
    createObservers();
    installNavigationEvents();
    rebuild();
  }'''
new_start = '''  function start() {
    installNavigationEvents();
    startDiscovery();
  }'''
if old_start not in text:
    raise SystemExit("Start block not found after lifecycle replacement.")
text = text.replace(old_start, new_start, 1)

# The lifecycle replacement removes scheduleRebuild/createObservers, so navigation
# listeners must call startDiscovery instead of the deleted function.
if "scheduleRebuild(" in text[text.find("function installNavigationEvents"):]:
    raise SystemExit("A navigation scheduleRebuild reference remains.")

TARGET.write_text(text, encoding="utf-8")
print(f"Wrote {TARGET} ({len(text):,} chars)")
